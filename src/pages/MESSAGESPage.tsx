import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, ChevronLeft, MessageSquare, X } from 'lucide-react';
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
      <h2 className="text-lg font-black text-foreground">{t.noMessages}</h2>
      <Link to="/auth" className="px-6 py-2.5 bg-dz-green text-white font-bold rounded-xl shadow-brand-sm">{t.login}</Link>
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
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <MessageSquare size={28} className="text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">{t.noMessages}</p>
            </div>
          )}
          {threads.map(th => (
            <button key={th.id} onClick={() => setActiveId(th.id)}
              className={`w-full flex items-start gap-3 p-4 text-left border-b border-border/50 transition-colors hover:bg-muted
                ${activeId === th.id ? 'bg-dz-green/5 border-r-2 border-r-dz-green' : ''}`}>
              <img src={th.userAvatar} alt={th.userName} className="w-11 h-11 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-0.5">
                  <span className={`text-sm ${th.unread > 0 ? 'font-black text-foreground' : 'font-semibold text-foreground'}`}>
                    {th.userName}
                  </span>
                  {th.unread > 0 && (
                    <span className="bg-dz-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">{th.unread}</span>
                  )}
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
            {/* Chat header */}
            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
              <button onClick={() => setActiveId(null)} className="md:hidden p-1.5 hover:bg-muted rounded-lg">
                <ChevronLeft size={18} />
              </button>
              <img src={active.userAvatar} alt={active.userName} className="w-9 h-9 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground">{active.userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">📋 {active.listingTitle}</p>
              </div>
              {active.listingImage && (
                <img src={active.listingImage} alt="" className="w-10 h-10 rounded-lg object-cover hidden sm:block" />
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'hsl(var(--muted)/0.3)' }}>
              {active.messages.map(msg => (
                <div key={msg.id}
                  className={`flex ${msg.from === 'u1' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {msg.from !== 'u1' && (
                    <img src={active.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                  )}
                  <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm shadow-sm
                    ${msg.from === 'u1'
                      ? 'bg-dz-green text-white rounded-br-sm'
                      : 'bg-card text-foreground border border-border rounded-bl-sm'}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[9px] mt-1 text-right ${msg.from === 'u1' ? 'opacity-60' : 'text-muted-foreground'}`}>
                      {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex items-end gap-2 bg-card">
              <div className="flex-1 bg-muted rounded-2xl px-4 py-2.5 min-h-[42px] flex items-center">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t.typeMessage}
                  rows={1}
                  className="w-full bg-transparent outline-none text-sm resize-none max-h-24 font-sans leading-relaxed"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="w-11 h-11 bg-dz-green hover:bg-dz-green2 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 shrink-0 shadow-brand-sm transition-all active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <MessageSquare size={28} className="opacity-40" />
            </div>
            <p className="font-semibold text-foreground">
              {language === 'ar' ? 'اختر محادثة' : language === 'en' ? 'Select a conversation' : 'Sélectionnez une conversation'}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {language === 'ar' ? 'ستظهر ردود البائعين هنا'
                : language === 'en' ? 'Seller replies will appear here'
                : 'Les réponses des vendeurs apparaissent ici'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
