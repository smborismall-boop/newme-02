import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API, BACKEND_URL } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle, CreditCard, Copy } from "lucide-react";

const PaymentPage = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    paymentAmount: 50000,
    paymentMethod: '',
    notes: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchPaymentStatus();
  }, [registrationId]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      if (response.data.paymentAmount) {
        setFormData(prev => ({ ...prev, paymentAmount: response.data.paymentAmount }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchPaymentStatus = async () => {
    try {
      const response = await axios.get(`${API}/payments/registration/${registrationId}`);
      if (response.data) {
        setPayment(response.data);
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
        toast.error('Hanya file JPG, JPEG, atau PNG yang diperbolehkan');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Pilih file bukti pembayaran');
      return;
    }
    if (!formData.paymentMethod) {
      toast.error('Pilih metode pembayaran');
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('registrationId', registrationId);
      uploadData.append('paymentAmount', formData.paymentAmount);
      uploadData.append('paymentMethod', formData.paymentMethod);
      if (formData.notes) {
        uploadData.append('notes', formData.notes);
      }

      const response = await axios.post(`${API}/payments/upload-proof`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Bukti pembayaran berhasil diupload!');
        fetchPaymentStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal upload bukti pembayaran');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="mr-1 h-3 w-3" /> Menunggu Approval</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Disetujui</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="mr-1 h-3 w-3" /> Ditolak</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/test" className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Test
          </Link>
          <h1 className="text-3xl font-bold text-white">Pembayaran</h1>
          <p className="text-gray-400">Upload bukti pembayaran untuk Test Premium</p>
        </div>

        {/* Payment Status */}
        {payment && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Status Pembayaran</CardTitle>
                {getStatusBadge(payment.status)}
              </div>
            </CardHeader>
            <CardContent>
              {payment.status === 'pending' && (
                <p className="text-gray-300">
                  Bukti pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu maksimal 1x24 jam.
                </p>
              )}
              {payment.status === 'approved' && (
                <div className="space-y-4">
                  <p className="text-green-400">
                    Pembayaran Anda telah disetujui! Anda dapat melanjutkan test premium.
                  </p>
                  <Button 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    onClick={() => navigate('/test')}
                  >
                    Lanjut ke Test Premium
                  </Button>
                </div>
              )}
              {payment.status === 'rejected' && (
                <div className="space-y-2">
                  <p className="text-red-400">Pembayaran ditolak.</p>
                  {payment.rejectionReason && (
                    <p className="text-gray-400">Alasan: {payment.rejectionReason}</p>
                  )}
                  <p className="text-gray-300">Silakan upload ulang bukti pembayaran yang valid.</p>
                </div>
              )}
              {payment.paymentProofUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Bukti Pembayaran:</p>
                  <img 
                    src={`${BACKEND_URL}${payment.paymentProofUrl}`} 
                    alt="Bukti Pembayaran" 
                    className="max-w-full h-auto rounded-lg border border-gray-600"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Info */}
        {(!payment || payment.status === 'rejected') && (
          <>
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-yellow-400" />
                  Informasi Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-400">
                    Rp {(settings?.paymentAmount || 50000).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-400">Total Pembayaran Test Premium</p>
                </div>

                <div className="space-y-3">
                  <p className="text-white font-medium">Transfer ke:</p>
                  
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Bank {settings?.bankName || 'BCA'}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-mono text-lg">{settings?.bankAccountNumber || '1234567890'}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(settings?.bankAccountNumber || '1234567890')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm">a.n. {settings?.bankAccountName || 'NEWME CLASS'}</p>
                  </div>

                  {settings?.paymentInstructions && (
                    <div className="bg-yellow-400/10 border border-yellow-400/50 p-3 rounded-lg">
                      <p className="text-yellow-400 text-sm">{settings.paymentInstructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upload Form */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5 text-yellow-400" />
                  Upload Bukti Pembayaran
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upload screenshot atau foto bukti transfer Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label className="text-white">Metode Pembayaran *</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                        <SelectItem value="E-Wallet (OVO)">E-Wallet (OVO)</SelectItem>
                        <SelectItem value="E-Wallet (GoPay)">E-Wallet (GoPay)</SelectItem>
                        <SelectItem value="E-Wallet (DANA)">E-Wallet (DANA)</SelectItem>
                        <SelectItem value="QRIS">QRIS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Bukti Pembayaran *</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">
                            {file ? file.name : 'Klik untuk upload atau drag & drop'}
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max. 5MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {file && (
                      <div className="mt-2">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="max-h-40 rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-white">Catatan (Opsional)</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Tambahkan catatan jika diperlukan"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    disabled={uploading || !file || !formData.paymentMethod}
                  >
                    {uploading ? 'Mengupload...' : 'Upload Bukti Pembayaran'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
