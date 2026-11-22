import React, { useState, useEffect } from 'react';
import { Download, Maximize2, X, QrCode, AlertCircle } from 'lucide-react';

interface PaymentQRDisplayProps {
  amount: number;
}

const CANDIDATE_QR_PATHS = [
  import.meta.env.VITE_PAYMENT_QR_URL,
  '/payment-qr.jpg',
  '/payment-qr.png',
  '/payment-qr.jpeg',
  '/payment-qr.webp',
].filter((p): p is string => Boolean(p && p.trim()));

export const PaymentQRDisplay: React.FC<PaymentQRDisplayProps> = ({ amount }) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [qrAvailable, setQrAvailable] = useState(true);
  const [isEnlarged, setIsEnlarged] = useState(false);

  const currentSrc = CANDIDATE_QR_PATHS[candidateIndex] || '/payment-qr.png';

  useEffect(() => {
    setCandidateIndex(0);
    setQrAvailable(true);
  }, []);

  const handleImageError = () => {
    if (candidateIndex + 1 < CANDIDATE_QR_PATHS.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setQrAvailable(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!qrAvailable) return;
    try {
      const response = await fetch(currentSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const extMatch = currentSrc.match(/\.(png|jpg|jpeg|webp)(\?.*)?$/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'png';

      const link = document.createElement('a');
      link.href = url;
      link.download = `NARMIS-Payment-QR.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback direct navigation download
      const link = document.createElement('a');
      link.href = currentSrc;
      link.download = 'NARMIS-Payment-QR.png';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-narmis-forestDark border border-narmis-gold/40 space-y-4">
      {/* Total Payable Header */}
      <div className="flex items-center justify-between border-b border-narmis-mountain/50 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90">
          <QrCode className="w-4 h-4 text-narmis-gold" />
          <span>UPI QR Payment</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wider text-narmis-cream/60">
            Total Payable
          </span>
          <span className="font-serif text-xl sm:text-2xl font-bold text-narmis-gold">
            ₹{amount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Exact Supplied QR Code Frame (Never cropped, stretched, or recreated) */}
      <div className="flex flex-col items-center">
        {qrAvailable ? (
          <div className="space-y-3 w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsEnlarged(true)}
              className="group relative bg-white p-3 sm:p-4 rounded-2xl shadow-xl border-2 border-narmis-gold/40 hover:border-narmis-gold transition-all focus:outline-none focus:ring-2 focus:ring-narmis-gold"
              title="Click to enlarge QR code for easier scanning"
            >
              <img
                src={currentSrc}
                alt="NARMIS UPI Payment QR Code"
                onError={handleImageError}
                className="block w-52 sm:w-60 h-auto max-h-[380px] object-contain mx-auto select-none"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <span className="mt-2 flex items-center justify-center gap-1 text-[11px] font-semibold text-narmis-charcoal/80 group-hover:text-narmis-charcoal">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Tap to Enlarge</span>
              </span>
            </button>

            {/* Enlarge & Download Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setIsEnlarged(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-narmis-surface hover:bg-narmis-mountain text-narmis-parchment border border-narmis-mountain text-xs font-semibold transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5 text-narmis-gold" />
                <span>Enlarge QR</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-narmis-surface hover:bg-narmis-mountain text-narmis-parchment border border-narmis-mountain text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-narmis-gold" />
                <span>Save / Download QR</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full p-5 rounded-2xl bg-narmis-surface/80 border border-amber-500/40 text-center space-y-2">
            <AlertCircle className="w-7 h-7 text-amber-400 mx-auto" />
            <p className="text-xs font-bold text-narmis-parchment">
              Payment QR Image Not Yet Added
            </p>
            <p className="text-[11px] text-narmis-cream/75 leading-relaxed max-w-sm mx-auto">
              Save your exact QR code image as{' '}
              <code className="px-1.5 py-0.5 rounded bg-narmis-forestDark text-narmis-gold">
                public/payment-qr.png
              </code>{' '}
              (or <code>.jpg</code> / <code>.webp</code>) and it will render here cleanly without
              cropping or distortion.
            </p>
          </div>
        )}
      </div>

      {/* Exact Required Payment Instructions */}
      <div className="p-3.5 rounded-xl bg-narmis-surface/90 border border-narmis-mountain/60 text-xs text-narmis-cream/85 leading-relaxed">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-narmis-gold mb-1">
          Payment Instructions
        </span>
        <p>
          Scan the QR code using your preferred UPI application and complete your payment. After
          completing the payment, follow the instructions on the screen to continue.
        </p>
      </div>

      {/* Enlarge Lightbox Modal for Mobile / Desktop Scanning */}
      {isEnlarged && qrAvailable && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsEnlarged(false)}
        >
          <div
            className="bg-narmis-surface border-2 border-narmis-gold rounded-3xl p-5 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsEnlarged(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-narmis-forestDark text-narmis-cream hover:text-white transition-colors"
              aria-label="Close enlarged QR"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h4 className="font-serif text-lg font-bold text-narmis-parchment">
                Scan to Pay ₹{amount.toLocaleString('en-IN')}
              </h4>
              <p className="text-xs text-narmis-cream/70 mt-0.5">
                Position your UPI scanner directly over the QR code
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl inline-block shadow-2xl mx-auto">
              <img
                src={currentSrc}
                alt="Enlarged NARMIS UPI Payment QR Code"
                className="block w-64 sm:w-80 max-w-full h-auto max-h-[65vh] object-contain mx-auto"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEnlarged(false)}
                className="px-5 py-2.5 rounded-full bg-narmis-mountain text-narmis-parchment text-xs font-semibold hover:bg-narmis-mountain/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
