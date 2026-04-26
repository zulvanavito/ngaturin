import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Tailwind,
  Section,
  Img,
  Link as EmailLink,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

export default function EmailChanged() {
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
                    src="http://ngaturin.web.id/logo.png"
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
                src="http://ngaturin.web.id/illustration/email/Forgot password-cuate.png"
                alt="Reset Password Ngaturin"
                width="200"
                height="200"
                className="mx-auto block"
              />
            </Section>

            {/* Main Content */}
            <Section className="px-8 text-center">
              <Heading className="text-[32px] font-black text-[#0e0f0c] m-0 leading-tight">
                Alamat email Anda
                <br />
                berhasil diubah
              </Heading>

              <Text className="text-[#454745] text-[16px] leading-[26px] mt-6 mb-8 font-medium max-w-[460px] mx-auto">
                Kami ingin memberitahu Anda bahwa alamat email untuk akun Ngaturin Anda baru saja diperbarui. Jika Anda melakukan perubahan ini, Anda tidak perlu melakukan apa pun.
              </Text>

            </Section>

            {/* Support Text */}
            <Section className="px-8 mt-4 text-center">
              <Text className="text-[#454745] text-[14px] leading-[22px] m-0 max-w-[400px] mx-auto">
                Jika Anda tidak merasa mengubah alamat email Anda, segera amankan akun Anda dengan menghubungi kami di{" "}
                <EmailLink
                  href="mailto:ngaturinhidup@gmail.com"
                  className="text-[#054d28] font-bold underline"
                >
                  ngaturinhidup@gmail.com
                </EmailLink>.
              </Text>
            </Section>

            <Section className="px-12 mt-8">
              <Hr className="border-t border-zinc-200" />
            </Section>

            {/* Legal / Copyright */}
            <Section className="px-8 mt-6 text-center">
              <Text className="text-[#868685] text-[11px] leading-[18px] m-0 max-w-[400px] mx-auto">
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
