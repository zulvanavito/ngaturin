"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/lib/toast-context";
import { addBlogComment } from "@/app/actions/blog-comments";
import { MessageSquare, CornerDownRight } from "lucide-react";

interface Comment {
  id: string;
  guest_name: string;
  guest_email: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
}

interface BlogCommentsProps {
  postSlug: string;
  initialComments: Comment[];
}

export function BlogComments({ postSlug, initialComments }: BlogCommentsProps) {
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const [state, formAction, isPending] = useActionState(addBlogComment, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      showToast("success", replyingTo ? "Balasan berhasil dikirim!" : "Komentar berhasil dikirim!");
      if (!replyingTo) {
        formRef.current?.reset();
      }
      setReplyingTo(null);
    } else if (state.error) {
      showToast("error", state.error);
    }
  }, [state, showToast, replyingTo]);

  const topLevelComments = initialComments.filter((c) => !c.parent_id);

  const renderForm = (parentId: string | null = null) => {
    const isReply = parentId !== null;
    return (
      <div className={`bg-[#f9faf9] dark:bg-[#121310] border border-gray-200 dark:border-white/10 ${isReply ? 'p-5 sm:p-6 rounded-[1.5rem] mt-4 ml-8 md:ml-12 border-l-4 border-l-[#9fe870]' : 'p-6 sm:p-8 rounded-[2rem] mb-12'}`}>
        {!isReply && (
          <p className="text-[#0e0f0c]/70 dark:text-gray-400 font-medium mb-6">
            Punya pertanyaan atau pengalaman terkait topik ini? Tulis di kolom komentar ya.
          </p>
        )}

        <form ref={!isReply ? formRef : undefined} action={formAction} className="flex flex-col gap-4 sm:gap-5">
          <input type="hidden" name="postSlug" value={postSlug} />
          {isReply && <input type="hidden" name="parentId" value={parentId} />}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor={`guestName-${parentId || 'main'}`} className="sr-only">Nama Anda</label>
              <input
                id={`guestName-${parentId || 'main'}`}
                name="guestName"
                type="text"
                placeholder="Nama Lengkap"
                required
                className="w-full px-4 py-3 bg-white dark:bg-[#1a1b18] border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9fe870] focus:border-transparent text-[#0e0f0c] dark:text-white placeholder:text-gray-400 font-medium transition-all"
              />
            </div>
            <div>
              <label htmlFor={`guestEmail-${parentId || 'main'}`} className="sr-only">Email Anda</label>
              <input
                id={`guestEmail-${parentId || 'main'}`}
                name="guestEmail"
                type="email"
                placeholder="Alamat Email"
                required
                className="w-full px-4 py-3 bg-white dark:bg-[#1a1b18] border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9fe870] focus:border-transparent text-[#0e0f0c] dark:text-white placeholder:text-gray-400 font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`content-${parentId || 'main'}`} className="sr-only">Isi Komentar</label>
            <textarea
              id={`content-${parentId || 'main'}`}
              name="content"
              rows={isReply ? 3 : 4}
              placeholder={isReply ? "Tulis balasanmu di sini..." : "Tulis komentarmu di sini..."}
              required
              className="w-full px-4 py-3 bg-white dark:bg-[#1a1b18] border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9fe870] focus:border-transparent text-[#0e0f0c] dark:text-white placeholder:text-gray-400 font-medium resize-none transition-all"
            ></textarea>
          </div>

          <div className="flex flex-wrap gap-3 mt-1">
            <button
              type="submit"
              disabled={isPending && (isReply ? replyingTo === parentId : replyingTo === null)}
              className="w-fit bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-[800] py-2.5 px-6 sm:px-8 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg text-sm sm:text-base"
            >
              {(isPending && (isReply ? replyingTo === parentId : replyingTo === null)) ? "Mengirim..." : isReply ? "Kirim Balasan" : "Kirim Komentar"}
            </button>
            
            {isReply && (
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="w-fit bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#0e0f0c] dark:text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm sm:text-base"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl sm:text-3xl font-[800] text-[#0e0f0c] dark:text-white tracking-tight mb-8">
        Tinggalkan Komentar
      </h2>

      {/* Main Comment Form */}
      {replyingTo === null && renderForm()}

      {/* Comments List */}
      {initialComments.length > 0 && (
        <div className="space-y-6 mt-8">
          <h3 className="text-xl font-[800] text-[#0e0f0c] dark:text-white mb-6">
            {initialComments.length} Komentar
          </h3>
          
          <div className="flex flex-col gap-6">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-4">
                {/* Parent Comment */}
                <div className="p-5 sm:p-6 bg-white dark:bg-[#121310] border border-gray-100 dark:border-white/10 rounded-[1.5rem] shadow-sm">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#9fe870]/20 flex items-center justify-center text-[#163300] font-bold shrink-0">
                      {comment.guest_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-[800] text-[#0e0f0c] dark:text-white">
                        {comment.guest_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {format(new Date(comment.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-4">
                    {comment.content}
                  </p>
                  <button 
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Balas
                  </button>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && renderForm(comment.id)}

                {/* Nested Replies */}
                {initialComments
                  .filter((reply) => reply.parent_id === comment.id)
                  .map((reply) => (
                    <div key={reply.id} className="ml-8 md:ml-12 p-4 sm:p-5 bg-muted/30 dark:bg-[#1a1b18]/50 border border-gray-100 dark:border-white/5 rounded-[1.5rem] relative">
                      <CornerDownRight className="absolute -left-6 top-6 w-4 h-4 text-gray-300 dark:text-gray-600" />
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0 text-xs">
                          {reply.guest_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-[800] text-[#0e0f0c] dark:text-white text-sm">
                            {reply.guest_name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            {format(new Date(reply.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-sm">
                        {reply.content}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
