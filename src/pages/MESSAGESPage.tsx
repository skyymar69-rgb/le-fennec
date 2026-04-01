import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, ChevronLeft, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

export const MessagesPage: React.FC = () => {
  const { t, language }                          = useLanguage();
  const { user, threads, sendMessage, markRead } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text,     setText]     = useState('');
  const endRef                  = useRef<HTMLDivElement>(null);
  const active = threads.find(th => th.id === activeId);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active?.messages.length]);
  useEffect(() => { if (activeId) markRead(activeId); }, [activeId, markRead]);

  const handleSend = () => {
    if (!text.trim() || !activeId) return;
    sendMessage(activeId, text.trim());
    setText('');
  };

  if (!user) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-6">
      <MessageSquare size={40} className="text-muted-foreground" />
      <h2 className="text-lg font-black text-foreground">
        {language === 'ar' ? 'سجّل دخولك لعرض الرسائل' : language === 'en' ? 'Sign in to see messages' : 'Connectez-vous pour voir vos messages'}
      </h2>
      <Link to="/auth" className="px-6 py-3 bg-dz-green text-white font-bold rounded-xl">{t.login}</Link>
    </div>
  );

  return (
    <div className="h-[calc(100vh-56px)] flex bg-background max-w-5xl mx-auto border-x border-border">
      {/* Thread list */}
      <div className={`flex-col border-r border-border bg-card ${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-72 shrink-0`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-black text-foreground">{t.myMessages}</h2>
          {threads.reduce((s, th) => s + th.unread, 0) > 0 && (
            <p className="text-xs font-bold text-dz-green mt-0.5">
              {threads.reduce((s, th) => s + th.unread, 0)} {t.unreadMsgs}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <MessageSquare size={32} className="text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">
                {language === 'ar' ? 'لا توجد رسائل بعد' : language === 'en' ? 'No messages yet' : 'Aucun message pour l\'instant'}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === 'ar' ? 'ستظهر محادثاتك مع البائعين هنا'
                  : language === 'en' ? 'Your conversations with sellers will appear here'
                  : 'Vos conversations avec les vendeurs apparaîtront ici'}
              </p>
              <Link to="/search" className="mt-2 text-xs font-bold text-dz-green hover:underline">
                {language === 'ar' ? 'تصفح الإعلانات →' : language === 'en' ? 'Browse listings →' : 'Explorer les annonces →'}
              </Link>
            </div>
          )}
          {threads.map(th => (
            <button key={th.id} onClick={() => setActiveId(th.id)}
              className={`w-full flex items-start gap-3 p-4 text-left border-b border-border/50 transition-colors hover:bg-muted
                ${activeId === th.id ? 'bg-dz-green/5 border-r-2 border-r-dz-green' : ''}`}>
              <img src={th.userAvatar} alt={th.userName} className="w-11 h-11 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-0.5">
                  <span className={`text-sm ${th.unread > 0 ? 'font-black text-foreground' : 'font-semibold text-foreground'}`}>{th.userName}</span>
                  {th.unread > 0 && <span className="bg-dz-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">{th.unread}</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{th.messages[th.messages.length - 1]?.text}</p>
                <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">📋 {th.listingTitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className={`flex-1 flex-col bg-background ${activeId ? 'flex' : 'hidden md:flex'}`}>
        {active ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
              <button onClick={() => setActiveId(null)} className="md:hidden p-1.5 hover:bg-muted rounded-lg"><ChevronLeft size={18} /></button>
              <img src={active.userAvatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
              <div>
                <p className="font-bold text-sm text-foreground">{active.userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">📋 {active.listingTitle}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
              {active.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'u1' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {msg.from !== 'u1' && <img src={active.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />}
                  <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm
                    ${msg.from === 'u1' ? 'bg-dz-green text-white rounded-br-sm' : 'bg-card border border-border rounded-bl-sm'}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[9px] mt-1 text-right ${msg.from === 'u1' ? 'opacity-60' : 'text-muted-foreground'}`}>
                      {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-border flex items-end gap-2 bg-card">
              <div className="flex-1 bg-muted rounded-2xl px-4 py-2.5">
                <textarea value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder={t.typeMessage} rows={1}
                  className="w-full bg-transparent outline-none text-sm resize-none max-h-24 font-sans" />
              </div>
              <button onClick={handleSend} disabled={!text.trim()}
                className="w-11 h-11 bg-dz-green rounded-2xl flex items-center justify-center text-white disabled:opacity-40 shadow-brand-sm">
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <MessageSquare size={28} className="opacity-30" />
            </div>
            <p className="font-semibold text-foreground">
              {language === 'ar' ? 'اختر محادثة' : language === 'en' ? 'Select a conversation' : 'Sélectionnez une conversation'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
