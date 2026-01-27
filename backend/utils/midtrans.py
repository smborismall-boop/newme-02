import midtransclient
import os
from datetime import datetime
import uuid

class MidtransService:
    def __init__(self):
        # Get Midtrans credentials from environment
        self.server_key = os.environ.get('MIDTRANS_SERVER_KEY', '')
        self.client_key = os.environ.get('MIDTRANS_CLIENT_KEY', '')
        self.is_production = os.environ.get('MIDTRANS_IS_PRODUCTION', 'false').lower() == 'true'
        
        # Initialize Snap API
        self.snap = midtransclient.Snap(
            is_production=self.is_production,
            server_key=self.server_key,
            client_key=self.client_key
        )
        
        # Initialize Core API for checking transaction status
        self.core_api = midtransclient.CoreApi(
            is_production=self.is_production,
            server_key=self.server_key,
            client_key=self.client_key
        )
    
    def create_qris_transaction(self, order_id: str, amount: int, customer_details: dict, item_details: list):
        """
        Create QRIS transaction using Midtrans
        
        Args:
            order_id: Unique order ID
            amount: Transaction amount in IDR
            customer_details: Dict with customer info (email, first_name, phone)
            item_details: List of items being purchased
            
        Returns:
            Dict with transaction token and redirect URL
        """
        try:
            # Build transaction parameters
            param = {
                "transaction_details": {
                    "order_id": order_id,
                    "gross_amount": amount
                },
                "item_details": item_details,
                "customer_details": customer_details,
                "enabled_payments": ["qris", "gopay", "shopeepay"],  # E-wallet options
                "expiry": {
                    "unit": "minutes",
                    "duration": 60  # 60 minutes expiry
                }
            }
            
            # Create transaction
            transaction = self.snap.create_transaction(param)
            
            return {
                "success": True,
                "token": transaction['token'],
                "redirect_url": transaction['redirect_url'],
                "order_id": order_id
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_transaction_status(self, order_id: str):
        """
        Check transaction status from Midtrans
        
        Args:
            order_id: Order ID to check
            
        Returns:
            Dict with transaction status
        """
        try:
            status_response = self.core_api.transactions.status(order_id)
            
            return {
                "success": True,
                "order_id": status_response['order_id'],
                "transaction_id": status_response.get('transaction_id'),
                "transaction_status": status_response['transaction_status'],
                "fraud_status": status_response.get('fraud_status'),
                "payment_type": status_response.get('payment_type'),
                "gross_amount": status_response.get('gross_amount'),
                "transaction_time": status_response.get('transaction_time'),
                "settlement_time": status_response.get('settlement_time'),
                "status_message": status_response.get('status_message')
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def verify_notification(self, notification_data: dict):
        """
        Verify and process Midtrans notification
        
        Args:
            notification_data: Notification payload from Midtrans
            
        Returns:
            Dict with verification result and status
        """
        try:
            status_response = self.core_api.transactions.notification(notification_data)
            
            order_id = status_response['order_id']
            transaction_status = status_response['transaction_status']
            fraud_status = status_response.get('fraud_status')
            
            # Determine final status
            if transaction_status == 'capture':
                if fraud_status == 'accept':
                    final_status = 'success'
                else:
                    final_status = 'pending'
            elif transaction_status == 'settlement':
                final_status = 'success'
            elif transaction_status in ['cancel', 'deny', 'expire']:
                final_status = 'failed'
            elif transaction_status == 'pending':
                final_status = 'pending'
            else:
                final_status = 'unknown'
            
            return {
                "success": True,
                "order_id": order_id,
                "transaction_id": status_response.get('transaction_id'),
                "status": final_status,
                "transaction_status": transaction_status,
                "fraud_status": fraud_status,
                "payment_type": status_response.get('payment_type'),
                "gross_amount": status_response.get('gross_amount'),
                "transaction_time": status_response.get('transaction_time')
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_order_id(self, user_id: str, prefix: str = "NEWME"):
        """
        Generate unique order ID
        
        Args:
            user_id: User ID
            prefix: Order ID prefix (default: NEWME)
            
        Returns:
            Unique order ID string
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_str = str(uuid.uuid4())[:8].upper()
        return f"{prefix}-{timestamp}-{random_str}"

# Singleton instance
_midtrans_service = None

def get_midtrans_service():
    """Get or create Midtrans service instance"""
    global _midtrans_service
    if _midtrans_service is None:
        _midtrans_service = MidtransService()
    return _midtrans_service
