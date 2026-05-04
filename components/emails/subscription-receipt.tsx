import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SubscriptionReceiptEmailProps {
  customerName?: string;
  orderId?: string;
  planName?: string;
  amount?: number;
  paymentMethod?: string;
  date?: string;
}

export const SubscriptionReceiptEmail = ({
  customerName = "Pengguna",
  orderId = "SUBS-123456789",
  planName = "PRO (Tahunan)",
  amount = 278400,
  paymentMethod = "BCA Virtual Account",
  date = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
}: SubscriptionReceiptEmailProps) => {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <Html>
      <Head />
      <Preview>Tanda Terima Pembayaran Ngaturin: {planName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Ngaturin.</Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>Pembayaran Berhasil 🎉</Heading>
            <Text style={paragraph}>
              Halo <strong>{customerName}</strong>,
            </Text>
            <Text style={paragraph}>
              Terima kasih telah berlangganan di Ngaturin. Pembayaran Anda untuk paket <strong>{planName}</strong> telah kami terima. Akun Anda sekarang sudah otomatis diperbarui ke paket premium.
            </Text>

            <Section style={receiptBox}>
              <Text style={receiptTitle}>Detail Transaksi</Text>
              
              <Section style={receiptRow}>
                <Text style={receiptLabel}>ID Pesanan</Text>
                <Text style={receiptValue}>{orderId}</Text>
              </Section>
              <Hr style={receiptDivider} />
              
              <Section style={receiptRow}>
                <Text style={receiptLabel}>Tanggal</Text>
                <Text style={receiptValue}>{date}</Text>
              </Section>
              <Hr style={receiptDivider} />

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Paket Berlangganan</Text>
                <Text style={receiptValue}>{planName}</Text>
              </Section>
              <Hr style={receiptDivider} />

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Metode Pembayaran</Text>
                <Text style={receiptValue}>{paymentMethod}</Text>
              </Section>
              <Hr style={receiptDivider} />

              <Section style={receiptRow}>
                <Text style={receiptTotalLabel}>Total Dibayar</Text>
                <Text style={receiptTotalValue}>{formattedAmount}</Text>
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Link href="https://ngaturin.vercel.app/dashboard/profile?tab=history" style={button}>
                Buka Dashboard
              </Link>
            </Section>

            <Text style={footerText}>
              Jika Anda memiliki pertanyaan mengenai tagihan ini, jangan ragu untuk membalas email ini.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Ngaturin. Semua hak dilindungi.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionReceiptEmail;

// --- Styles based on Wise Design System ---

const main = {
  backgroundColor: "#e8ebe6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 0 60px",
  width: "100%",
  maxWidth: "600px",
};

const header = {
  padding: "0 20px",
  textAlign: "center" as const,
  marginBottom: "20px",
};

const logo = {
  color: "#0e0f0c",
  fontSize: "32px",
  fontWeight: "900",
  margin: "0",
  letterSpacing: "-1px",
};

const content = {
  backgroundColor: "#ffffff",
  border: "1px solid rgba(14,15,12,0.12)",
  borderRadius: "30px",
  padding: "40px",
  overflow: "hidden",
};

const heading = {
  color: "#0e0f0c",
  fontSize: "26px",
  fontWeight: "900",
  margin: "0 0 20px 0",
  letterSpacing: "-0.5px",
};

const paragraph = {
  color: "#454745",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px 0",
};

const receiptBox = {
  backgroundColor: "#f7f9f6",
  border: "1px solid rgba(14,15,12,0.12)",
  borderRadius: "20px",
  padding: "24px",
  margin: "30px 0",
};

const receiptTitle = {
  color: "#0e0f0c",
  fontSize: "14px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 16px 0",
};

const receiptRow = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
};

const receiptLabel = {
  color: "#868685",
  fontSize: "15px",
  margin: "0",
  display: "inline-block",
  width: "50%",
};

const receiptValue = {
  color: "#0e0f0c",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0",
  display: "inline-block",
  width: "50%",
  textAlign: "right" as const,
};

const receiptDivider = {
  borderColor: "rgba(14,15,12,0.08)",
  margin: "12px 0",
};

const receiptTotalLabel = {
  color: "#0e0f0c",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
  display: "inline-block",
  width: "50%",
};

const receiptTotalValue = {
  color: "#163300",
  fontSize: "20px",
  fontWeight: "900",
  margin: "0",
  display: "inline-block",
  width: "50%",
  textAlign: "right" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "40px 0 20px 0",
};

const button = {
  backgroundColor: "#9fe870",
  borderRadius: "9999px",
  color: "#163300",
  fontSize: "18px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
};

const footerText = {
  color: "#868685",
  fontSize: "14px",
  lineHeight: "22px",
  textAlign: "center" as const,
  margin: "20px 0 0 0",
};

const footer = {
  padding: "20px",
  textAlign: "center" as const,
};

const footerCopyright = {
  color: "#868685",
  fontSize: "14px",
  margin: "0",
};
