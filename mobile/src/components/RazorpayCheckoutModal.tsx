import { useMemo } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { RazorpayCreateOrderResponse, RazorpayPaymentSuccess } from '../api/types';
import { colors } from '../theme';

type Props = {
  visible: boolean;
  payload: RazorpayCreateOrderResponse | null;
  onSuccess: (payment: RazorpayPaymentSuccess) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

function checkoutDescription(payload: RazorpayCreateOrderResponse): string {
  const hints = payload.test_payment_hints;
  if (!hints) return payload.description;
  return `${payload.description} — Test UPI: ${hints.upi}`;
}

function buildCheckoutHtml(payload: RazorpayCreateOrderResponse): string {
  const prefill = JSON.stringify(payload.prefill);
  const description = JSON.stringify(checkoutDescription(payload));
  const key = JSON.stringify(payload.key_id);
  const orderId = JSON.stringify(payload.razorpay_order_id);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>body { margin: 0; background: #DCDADE; }</style>
</head>
<body>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    (function () {
      function post(obj) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(obj));
        }
      }
      var options = {
        key: ${key},
        amount: ${payload.amount},
        currency: ${JSON.stringify(payload.currency)},
        name: "Vexo Cart",
        description: ${description},
        order_id: ${orderId},
        prefill: ${prefill},
        theme: { color: "#02ABB0" },
        handler: function (response) {
          post({
            ok: true,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            post({ ok: false, cancelled: true });
          },
        },
      };
      try {
        var rzp = new Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          var msg = (resp.error && resp.error.description) || "Payment failed";
          post({ ok: false, error: msg });
        });
        rzp.open();
      } catch (e) {
        post({ ok: false, error: String(e) });
      }
    })();
  </script>
</body>
</html>`;
}

export function RazorpayCheckoutModal({ visible, payload, onSuccess, onCancel, onError }: Props) {
  const html = useMemo(() => (payload ? buildCheckoutHtml(payload) : ''), [payload]);

  if (!visible || !payload) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.wrap}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data) as {
                ok: boolean;
                cancelled?: boolean;
                error?: string;
                razorpay_payment_id?: string;
                razorpay_order_id?: string;
                razorpay_signature?: string;
              };
              if (data.ok && data.razorpay_payment_id && data.razorpay_order_id && data.razorpay_signature) {
                onSuccess({
                  razorpay_payment_id: data.razorpay_payment_id,
                  razorpay_order_id: data.razorpay_order_id,
                  razorpay_signature: data.razorpay_signature,
                });
                return;
              }
              if (data.cancelled) {
                onCancel();
                return;
              }
              onError(data.error || 'Payment could not be completed.');
            } catch {
              onError('Invalid response from payment gateway.');
            }
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
