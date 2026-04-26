import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Button,
  Tailwind,
  Section,
  Img,
  Link as EmailLink,
  Hr,
  Row,
  Column,
} from "@react-email/components";

export default function ChangeEmail() {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#f9f9f9] font-sans m-0 p-0">
          <Container className="bg-white w-full max-w-[600px] mx-auto p-0 pb-12 text-center">
            <Section className="pt-10 pb-2">
              <Row align="center" className="w-fit mx-auto">
                <Column align="right" className="pr-2">
                  <Img
                    src="http://localhost:3000/logo.png"
                    alt="Ngaturin Logo"
                    width="35"
                    height="35"
                    className="inline-block align-middle"
                  />
                </Column>
                <Column align="left">
                  <Text className="text-2xl font-black text-[#0e0f0c] m-0 tracking-tight leading-none inline-block align-middle">
                    Ngaturin.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Hero Banner Placeholder */}
            <Section className="px-8 pb-4 text-center">
              <Img
                src="http://localhost:3000/illustration/email/New message-cuate.png"
                alt="Change Email Ngaturin"
                width="200"
                height="200"
                className="mx-auto block"
              />
            </Section>

            {/* Main Content */}
            <Section className="px-8 text-center">
              <Heading className="text-[32px] font-black text-[#0e0f0c] m-0 leading-tight">
                Konfirmasi alamat
                <br />
                email baru
              </Heading>

              <Text className="text-[#454745] text-[16px] leading-[26px] mt-6 mb-8 font-medium max-w-[460px] mx-auto">
                Kami menerima permintaan untuk mengubah alamat email akun
                Ngaturin Anda. Klik tombol di bawah ini untuk memverifikasi
                alamat email baru Anda.
              </Text>

              {/* Supabase Variable for Confirmation URL */}
              <Button
                href="{{ .ConfirmationURL }}"
                className="bg-[#9fe870] text-[#163300] font-bold px-10 py-4 rounded-full text-[16px] inline-block  transition-colors"
              >
                Konfirmasi Email Baru
              </Button>
            </Section>

            {/* Support Text */}
            <Section className="px-8 mt-14 text-center">
              <Text className="text-[#454745] text-[14px] leading-[22px] m-0 max-w-[400px] mx-auto">
                Jika Anda tidak merasa melakukan perubahan ini, segera hubungi
                tim keamanan kami di{" "}
                <EmailLink
                  href="mailto:ngaturinhidup@gmail.com"
                  className="text-[#054d28] font-bold underline"
                >
                  ngaturinhidup@gmail.com
                </EmailLink>
                .
              </Text>
            </Section>

            <Section className="px-12 mt-8">
              <Hr className="border-t border-zinc-200" />
            </Section>

            {/* Legal / Copyright */}
            <Section className="px-8 mt-6 text-center">
              <Text className="text-[#868685] text-[11px] leading-[18px] m-0 max-w-[400px] mx-auto">
                Anda menerima email ini karena terdaftar sebagai pengguna
                Ngaturin.
                <br />
                © 2026 Ngaturin.
                <br />
                Hak Cipta Dilindungi.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
