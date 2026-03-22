"use client";
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Assicuriamoci di chiamare loadStripe fuori dal lifecycle del componente
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy');

function StripeCheckoutForm({ total, orderNumber, onSuccess, isProcessing, setIsProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    // Il confirmPayment tenterà di processare la carta.
    // In un flusso Reale, se va a buon fine redirige. Ma noi facciamo "redirect: 'if_required'"
    // per gestire l'UI da single-page-app.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Successo! 
      // Il Webhook creerà fisicamente l'ordine in DB, ma intanto avvisiamo il frontend.
      const uiOrderNumber = orderNumber || paymentIntent.id.slice(-6).toUpperCase(); 
      onSuccess(uiOrderNumber, paymentIntent.id);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {errorMessage}
        </div>
      )}

      <button
        disabled={!stripe || isProcessing}
        className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Elaborazione...
          </span>
        ) : (
          `Paga ${parseFloat(total).toFixed(2)} €`
        )}
      </button>
    </form>
  );
}

export default function CheckoutModal({ cart, total, restaurantId, stripeAccountId, onClose, onSuccess }) {
  const [clientSecret, setClientSecret] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  useEffect(() => {
    // Genera il PaymentIntent sul backend
    const getPI = async () => {
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, total, restaurantId, stripeAccountId })
        });
        const data = await res.json();
        
        if (data.success) {
          setClientSecret(data.clientSecret);
          setOrderNumber(data.orderNumber);
        } else {
          setErrorLocal(data.error || "Errore nella generazione del pagamento");
        }
      } catch (err) {
        setErrorLocal('Errore di connessione al server');
      }
    };

    if (total > 0 && stripeAccountId) {
      getPI();
    } else if (!stripeAccountId) {
      setErrorLocal("Il ristorante non ha configurato la ricezione dei pagamenti.");
    }
  }, [cart, total, restaurantId, stripeAccountId]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[420px] rounded-[2rem] flex flex-col mx-auto overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">Checkout sicuro</h3>
          <button onClick={onClose} disabled={isProcessing} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-6">
          {errorLocal ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <p className="text-slate-600 font-medium mb-4">{errorLocal}</p>
              <button onClick={onClose} className="bg-slate-100 font-bold px-6 py-2 rounded-lg hover:bg-slate-200">Chiudi</button>
            </div>
          ) : !clientSecret ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <svg className="animate-spin h-8 w-8 mb-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="font-medium text-sm">Inizializzazione pagamento certificato...</p>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#4f46e5' } } }}>
               <StripeCheckoutForm 
                 total={total} 
                 orderNumber={orderNumber}
                 onSuccess={onSuccess} 
                 isProcessing={isProcessing} 
                 setIsProcessing={setIsProcessing} 
               />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
