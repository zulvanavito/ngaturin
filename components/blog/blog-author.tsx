import Image from "next/image";

interface BlogAuthorProps {
  author?: {
    name: string;
    avatar_url?: string | null;
    bio?: string | null;
  };
}

export function BlogAuthor({ author }: BlogAuthorProps) {
  // Jika admin belum mengisi data author, gunakan fallback statis sementara
  const displayAuthor = author || {
    name: "Irhan Hisyam Dwi Nugroho",
    avatar_url: "/placeholder-author.jpg", // Ensure you have this or it'll fail, let's just use a generic avatar from UI
    bio: "Mahasiswa akhir Sistem Informasi (S.Kom) Universitas Pendidikan Ganesha sekaligus Content Writer & SEO Specialist berpengalaman lebih dari 2 tahun. Berfokus pada penulisan konten yang ramah mesin pencari (SEO-friendly) untuk topik teknologi, beasiswa, dan pendidikan.",
  };

  return (
    <div className="mt-16 p-6 sm:p-8 bg-[#f9faf9] dark:bg-[#121310] rounded-[2rem] border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row gap-6 items-start">
      <div className="shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative rounded-2xl overflow-hidden shadow-md">
          {displayAuthor.avatar_url && displayAuthor.avatar_url !== "/placeholder-author.jpg" ? (
            <Image 
              src={displayAuthor.avatar_url} 
              alt={displayAuthor.name} 
              fill 
              className="object-cover"
            />
          ) : (
            // Fallback avatar dummy if no image
            <div className="w-full h-full bg-[#9fe870]/20 flex items-center justify-center text-[#163300] font-black text-4xl">
              {displayAuthor.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-xl sm:text-2xl font-[800] text-[#0e0f0c] dark:text-white mb-2 tracking-tight">
          {displayAuthor.name}
        </h3>
        {displayAuthor.bio && (
          <p className="text-[#0e0f0c]/70 dark:text-gray-400 font-medium leading-[1.6] text-sm sm:text-base">
            {displayAuthor.bio}
          </p>
        )}
      </div>
    </div>
  );
}
