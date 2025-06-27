
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PRICING_PLANS, type PlanType } from '@/lib/config/pricing';

interface PayPalSubscriptionProps {
  plan: PlanType;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PayPalSubscription({ plan, onSuccess, onCancel }: PayPalSubscriptionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const planData = PRICING_PLANS[plan];

  const createSubscription = async () => {
    try {
      const response = await fetch('/api/create-paypal-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: plan,
          amount: planData.price,
          user_id: user?.id,
        }),
      });

      const { subscription_id } = await response.json();
      return subscription_id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  const handleApprove = async (data: any) => {
    setLoading(true);
    try {
      // Record the payment in database
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          paypalPaymentId: data.subscriptionID,
          amountCents: planData.price * 100,
          currency: 'USD',
          status: 'completed',
          paymentType: 'subscription',
          description: `${planData.name} plan subscription`,
        }),
      });

      if (!response.ok) throw new Error('Failed to record payment');

      toast({
        title: "Success!",
        description: `You've successfully subscribed to the ${planData.name} plan.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
        vault: true,
        intent: 'subscription',
      }}
    >
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'subscribe',
        }}
        createSubscription={createSubscription}
        onApprove={handleApprove}
        onCancel={onCancel}
        onError={(error) => {
          console.error('PayPal error:', error);
          toast({
            title: "Payment Error",
            description: "There was an error processing your payment.",
            variant: "destructive",
          });
        }}
        disabled={loading}
      />
    </PayPalScriptProvider>
  );
}
