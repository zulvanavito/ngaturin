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

interface AutoSaveGoal {
  title: string;
  amount: number;
  currentAmount: number;
  targetAmount: number;
  isCompleted: boolean;
}

interface AutoSaveReportProps {
  userName?: string;
  successGoals?: AutoSaveGoal[];
  failedGoals?: { title: string; reason: string }[];
  completedGoals?: AutoSaveGoal[];
  date?: string;
}

export default function AutoSaveReport({
  userName = "Pengguna",
  successGoals = [],
  failedGoals = [],
  completedGoals = [],
  date = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
}: AutoSaveReportProps) {
  const hasSuccess = successGoals.length > 0;
  const hasFailed = failedGoals.length > 0;
  const hasCompleted = completedGoals.length > 0;

  const totalSaved = successGoals.reduce((sum, g) => sum + g.amount, 0);

  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-[#f4f7f3] font-sans m-0 p-0">
          <Container className="bg-white w-full max-w-[600px] mx-auto p-0 pb-12 overflow-hidden shadow-xl rounded-b-[40px]">
            {/* Header */}
            <Section
              style={{
                paddingTop: "40px",
                paddingBottom: "8px",
                textAlign: "center",
              }}
            >
              <Row
                align="center"
                style={{ width: "fit-content", margin: "0 auto" }}
              >
                <Column align="right" style={{ paddingRight: "8px" }}>
                  <Img
                    src="https://ngaturin.web.id/logo.png"
                    alt="Ngaturin Logo"
                    width="35"
                    height="35"
                    className="inline-block align-middle"
                  />
                </Column>
                <Column align="left">
                  <Text
                    style={{
                      fontSize: "24px",
                      fontWeight: "900",
                      color: "#0e0f0c",
                      margin: 0,
                      letterSpacing: "-0.5px",
                      lineHeight: "1",
                      textTransform: "capitalize",
                    }}
                  >
                    Ngaturin.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Hero Illustration */}
            <Section className="px-8 pb-4 text-center">
              <Img
                src="https://ngaturin.web.id/illustration/email/Saving money-pana.png"
                alt="Ngaturin Saving"
                width="200"
                height="200"
                className="mx-auto block"
              />
            </Section>

            {/* Title Section */}
            <Section className="px-8 text-center">
              <Heading className="text-[32px] font-black text-[#0e0f0c] m-0 leading-tight capitalize">
                Laporan Nabung
                <span style={{ color: "#9fe870" }}> Otomatis</span>
              </Heading>
              <Text className="text-[#868685] text-[13px] mt-2 mb-0 font-bold tracking-widest uppercase">
                {date}
              </Text>
            </Section>

            {/* Summary Stat */}
            {hasSuccess && (
              <Section className="px-10 mt-8 text-center">
                <Text className="text-[#0e0f0c] text-[18px] font-semibold m-0">
                  Total yang berhasil ditabung:
                </Text>
                <Heading className="text-[48px] font-black text-[#054d28] m-0 leading-tight">
                  Rp {totalSaved.toLocaleString("id-ID")}
                </Heading>
                <Section className="bg-[#9fe870] h-[4px] w-24 mx-auto mt-2 rounded-full" />
              </Section>
            )}

            <Section className="px-10 mt-10">
              <Text className="text-[#0e0f0c] text-[20px] leading-[28px] m-0 font-black tracking-tight">
                Halo {userName},
              </Text>
              <Text className="text-[#454745] text-[16px] leading-[24px] mt-2 mb-0 font-medium">
                {hasSuccess || hasFailed
                  ? "Berikut adalah rincian aktivitas menabung otomatis Anda hari ini. Satu langkah lebih dekat menuju impian Anda!"
                  : "Sepertinya hari ini tidak ada jadwal menabung otomatis. Tetap semangat mengelola keuangan Anda!"}
              </Text>
            </Section>

            {/* Success Section */}
            {hasSuccess && (
              <Section className="px-10 mt-10 text-left">
                <Text className="text-[14px] font-black text-[#054d28] uppercase tracking-[2px] m-0 mb-4">
                  ✅ TARGET TERCAPAI HARI INI
                </Text>
                {successGoals.map((goal, i) => {
                  const progress = Math.min(
                    Math.round((goal.currentAmount / goal.targetAmount) * 100),
                    100,
                  );
                  return (
                    <Section
                      key={i}
                      className="bg-[#f0fae8] border-[1.5px] border-[#9fe870] rounded-[24px] p-6 mb-4 shadow-sm"
                    >
                      <Row>
                        <Column>
                          <Text className="text-[18px] font-black text-[#0e0f0c] m-0">
                            {goal.title}
                          </Text>
                          <Text className="text-[15px] font-bold text-[#054d28] m-0 mt-1">
                            + Rp {goal.amount.toLocaleString("id-ID")}
                          </Text>
                        </Column>
                        <Column align="right">
                          <Section className="bg-white rounded-full px-4 py-2 border border-[#9fe870]">
                            <Text className="text-[14px] font-black text-[#0e0f0c] m-0">
                              {progress}%
                            </Text>
                          </Section>
                        </Column>
                      </Row>
                      <Section className="bg-white/50 h-[8px] w-full rounded-full mt-4 overflow-hidden">
                        <Section
                          className="bg-[#054d28] h-full"
                          style={{ width: `${progress}%` }}
                        />
                      </Section>
                      <Text className="text-[12px] font-semibold text-[#868685] m-0 mt-3 uppercase tracking-wider">
                        Rp {goal.currentAmount.toLocaleString("id-ID")} dari Rp{" "}
                        {goal.targetAmount.toLocaleString("id-ID")}
                      </Text>
                    </Section>
                  );
                })}
              </Section>
            )}

            {/* Completed Badge (Extra WOW) */}
            {hasCompleted && (
              <Section className="px-10 mt-4 text-center">
                <Section className="bg-[#9fe870] rounded-[20px] p-6 border-2 border-dashed border-[#163300]">
                  <Text className="text-[24px] m-0">🎉</Text>
                  <Heading className="text-[22px] font-black text-[#163300] m-0 mt-2 uppercase italic leading-none">
                    Target Tercapai!
                  </Heading>
                  <Text className="text-[#163300] text-[14px] font-bold mt-2 leading-snug">
                    Selamat! Beberapa target tabungan Anda telah mencapai garis
                    finish. Kerja bagus!
                  </Text>
                </Section>
              </Section>
            )}

            {/* Failed Section */}
            {hasFailed && (
              <Section className="px-10 mt-10 text-left">
                <Text className="text-[14px] font-black text-[#d03238] uppercase tracking-[2px] m-0 mb-4">
                  ⚠️ PERLU PERHATIAN
                </Text>
                {failedGoals.map((goal, i) => (
                  <Section
                    key={i}
                    className="bg-[#fef2f2] border-[1.5px] border-[#fecaca] rounded-[24px] p-6 mb-4"
                  >
                    <Text className="text-[18px] font-black text-[#0e0f0c] m-0">
                      {goal.title}
                    </Text>
                    <Text className="text-[14px] font-bold text-[#d03238] m-0 mt-1">
                      Gagal ditabung otomatis
                    </Text>
                    <Section className="bg-white/80 rounded-xl p-3 mt-3">
                      <Text className="text-[13px] font-medium text-[#454745] m-0 italic">
                        &quot;Alasan: {goal.reason}&quot;
                      </Text>
                    </Section>
                  </Section>
                ))}
              </Section>
            )}

            {/* CTA */}
            <Section className="px-10 mt-12 text-center">
              <EmailLink
                href="https://ngaturin.com/dashboard/goals"
                className="bg-[#9fe870] text-[#163300] font-black px-12 py-5 rounded-full text-[18px] inline-block no-underline shadow-lg"
              >
                LIHAT PROGRES SAYA →
              </EmailLink>
            </Section>

            {/* Footer / Tip */}
            <Section className="px-10 mt-16">
              <Hr className="border-t-2 border-[#f4f7f3]" />
              <Section className="mt-8 bg-[#f4f7f3] rounded-[30px] p-8 text-center">
                <Text className="text-[12px] font-black text-[#868685] uppercase tracking-[3px] m-0 mb-4">
                  💡 Tips Finansial
                </Text>
                <Text className="text-[#0e0f0c] text-[16px] font-bold leading-snug m-0">
                  &quot;Menabung itu bukan menyisakan yang tersisa, tapi
                  menyisihkan yang utama.&quot;
                </Text>
                <Text className="text-[#454745] text-[14px] mt-2 font-medium">
                  Terus gunakan Nabung Otomatis untuk membangun kebiasaan
                  finansial yang tak terhentikan.
                </Text>
              </Section>
            </Section>

            <Section className="px-10 mt-12 text-center">
              <Text className="text-[#868685] text-[11px] leading-[18px] m-0 font-semibold uppercase tracking-widest">
                © 2026 Ngaturin. Hak Cipta Dilindungi.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
