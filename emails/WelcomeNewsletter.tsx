import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Link,
} from "@react-email/components";
import * as React from "react";

interface WelcomeNewsletterProps {
  email: string;
}

export const WelcomeNewsletter = ({
  email,
}: WelcomeNewsletterProps) => {
  return (
    <Html>
      <Head />
      <Preview>Selamat datang di Newsletter Ngaturin!</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px] text-center">
              <span className="text-[#9fe870] font-black text-2xl tracking-tighter bg-[#163300] px-4 py-2 rounded-lg inline-block">
                NGATURIN
              </span>
            </Section>
            
            <Heading className="text-black text-[24px] font-bold text-center p-0 my-[30px] mx-0">
              Selamat datang di Wawasan Finansial Ngaturin!
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Halo,
            </Text>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Terima kasih telah berlangganan newsletter kami dengan email <strong>{email}</strong>. 
              Mulai sekarang, Anda akan mendapatkan artikel-artikel terbaik, tips pengelolaan keuangan, 
              budgeting, investasi, dan produktivitas langsung di kotak masuk Anda setiap minggunya.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Kami sangat antusias untuk menemani perjalanan Anda menuju kebebasan finansial yang lebih baik. 
              Sementara menunggu edisi pertama kami, Anda bisa membaca artikel-artikel menarik lainnya di blog kami.
            </Text>
            
            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                href="https://ngaturin.web.id/blog"
                className="bg-[#9fe870] text-[#163300] rounded-full font-bold px-6 py-3 text-[14px] no-underline inline-block"
              >
                Baca Blog Ngaturin
              </Link>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              Salam hangat,
              <br />
              Tim Ngaturin
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeNewsletter;
