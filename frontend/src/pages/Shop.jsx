import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Star, Check, CreditCard, Loader } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { productsAPI, transactionsAPI } from '../services/api';

const Shop = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [midtransConfig, setMidtransConfig] = useState(null);

  useEffect(() => {
    loadProducts();
    loadMidtransConfig();
    loadMidtransScript();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll({ isActive: true });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadMidtransConfig = async () => {
    try {
      const response = await transactionsAPI.getConfig();
      setMidtransConfig(response.data);
    } catch (error) {
      console.error('Failed to load Midtrans config');
    }
  };

  const loadMidtransScript = () => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY || '');
    document.body.appendChild(script);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!midtransConfig?.isConfigured) {
      toast({
        title: 'Pembayaran Tidak Tersedia',
        description: 'Sistem pembayaran belum dikonfigurasi. Silakan hubungi admin.',
        variant: 'destructive'
      });
      return;
    }

    setCheckoutLoading(true);
    
    try {
      const orderId = `ORDER-${Date.now()}`;
      
      const transactionData = {
        order_id: orderId,
        gross_amount: selectedProduct.price,
        items: [{
          id: selectedProduct._id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: 1
        }],
        customer: {
          first_name: customerForm.firstName,
          last_name: customerForm.lastName,
          email: customerForm.email,
          phone: customerForm.phone
        }
      };

      const response = await transactionsAPI.create(transactionData);
      
      if (response.data.token && window.snap) {
        window.snap.pay(response.data.token, {
          onSuccess: (result) => {
            toast({ title: 'Pembayaran Berhasil', description: 'Terima kasih atas pembelian Anda!' });
            setShowCheckout(false);
            setSelectedProduct(null);
          },
          onPending: (result) => {
            toast({ title: 'Pembayaran Pending', description: 'Silakan selesaikan pembayaran Anda.' });
          },
          onError: (result) => {
            toast({ title: 'Pembayaran Gagal', description: 'Terjadi kesalahan. Silakan coba lagi.', variant: 'destructive' });
          },
          onClose: () => {
            console.log('Payment popup closed');
          }
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal memproses checkout',
        variant: 'destructive'
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">NEWME Shop</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Temukan berbagai produk dan layanan untuk mendukung pengembangan bakat dan potensi Anda
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-4">Memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Belum ada produk tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="bg-[#2a2a2a] border-yellow-400/20 overflow-hidden hover:border-yellow-400/50 transition-all">
                <div className="aspect-video bg-[#1a1a1a] overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-700" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                    {product.stock > 0 ? (
                      <span className="text-xs px-2 py-1 bg-green-400/20 text-green-400 rounded">Tersedia</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-red-400/20 text-red-400 rounded">Habis</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  {product.features?.length > 0 && (
                    <div className="mb-4 space-y-1">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-300">
                          <Check className="w-4 h-4 text-yellow-400 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-yellow-400/20">
                    <span className="text-2xl font-bold text-yellow-400">{formatPrice(product.price)}</span>
                    <Button
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock === 0}
                      className="bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Beli Sekarang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Info */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Metode Pembayaran</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-[#2a2a2a] px-4 py-2 rounded-lg text-gray-400 text-sm">Bank Transfer</div>
            <div className="bg-[#2a2a2a] px-4 py-2 rounded-lg text-gray-400 text-sm">GoPay</div>
            <div className="bg-[#2a2a2a] px-4 py-2 rounded-lg text-gray-400 text-sm">OVO</div>
            <div className="bg-[#2a2a2a] px-4 py-2 rounded-lg text-gray-400 text-sm">DANA</div>
            <div className="bg-[#2a2a2a] px-4 py-2 rounded-lg text-gray-400 text-sm">Credit Card</div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-yellow-400/20">
              <h2 className="text-xl font-bold text-white">Checkout</h2>
            </div>
            <div className="p-4">
              {/* Product Summary */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
                <h3 className="text-white font-semibold">{selectedProduct.name}</h3>
                <p className="text-yellow-400 text-xl font-bold mt-2">{formatPrice(selectedProduct.price)}</p>
              </div>

              {/* Customer Form */}
              <form onSubmit={handleCheckout} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-sm">Nama Depan</label>
                    <input
                      type="text"
                      value={customerForm.firstName}
                      onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                      required
                      className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Nama Belakang</label>
                    <input
                      type="text"
                      value={customerForm.lastName}
                      onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    required
                    className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">No. Telepon</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    required
                    className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowCheckout(false); setSelectedProduct(null); }}
                    className="flex-1 border-gray-400 text-gray-400"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={checkoutLoading}
                    className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    {checkoutLoading ? (
                      <><Loader className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                    ) : (
                      <><CreditCard className="w-4 h-4 mr-2" /> Bayar Sekarang</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
