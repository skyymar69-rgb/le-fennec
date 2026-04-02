import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Send, ChevronLeft, MessageSquare, Search, Phone,
  MoreVertical, Check, CheckCheck, Image, Smile,
  ArrowLeft, ExternalLink, Trash2, Archive,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp }      from '../contexts/AppContext';
import type { MessageThread } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)   return 'À l\'instant';
  if (m < 60)  return `${m}min`;
  if (h < 24)  return `${h}h`;
  if (d === 1) return 'Hier';
  return `${d}j`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ── Thread item ────────────────────────────────────────────────────────────
const ThreadItem: React.FC<{
  thread:   MessageThread;
  isActive: boolean;
  myId:     string;
  onClick:  () => void;
}> = ({ thread, isActive, myId, onClick }) => {
  const last    = thread.messages[thread.messages.length - 1];
  const preview = last
    ? (last.from === myId ? `Vous: ${last.text}` : last.text)
    : 'Nouvelle conversation';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-border/50 hover:bg-muted/60 ${
        isActive ? 'bg-dz-green/5 border-l-2 border-l-dz-green' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {thread.listingImage ? (
          <img src={thread.listingImage} alt="" className="w-12 h-12 rounded-xl object-cover"/>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-dz-green/10 flex items-center justify-center text-xl">
            🦊
          </div>
        )}
        {/* Online dot */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-dz-green rounded-full border-2 border-card"/>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-1 mb-0.5">
          <p className={`text-sm font-bold truncate ${thread.unread > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
            {thread.listingTitle}
          </p>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {last ? timeAgo(last.ts) : ''}
          </span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <p className={`text-xs truncate ${thread.unread > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
            {preview}
          </p>
          {thread.unread > 0 && (
            <span className="shrink-0 min-w-[18px] h-[18px] bg-dz-green text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ── Quick reply suggestions ────────────────────────────────────────────────
const QUICK_REPLIES = [
  'Toujours disponible ?',
  'Quel est votre meilleur prix ?',
  'Je peux venir quand ?',
  'Merci !',
];

// ── Main component ─────────────────────────────────────────────────────────
export const MessagesPage: React.FC = () => {
  const { language }                                    = useLanguage();
  const { user, threads, sendMessage, markRead }        = useApp();
  const navigate                                        = useNavigate();
  const [activeId,   setActiveId]   = useState<string | null>(null);
  const [search,     setSearch]     = useState('');
  const [text,       setText]       = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const endRef                      = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);
  const myId = user?.id || 'me';

  const active = threads.find(th => th.id === activeId);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length]);

  // Mark as read when opening thread
  useEffect(() => {
    if (activeId) markRead(activeId);
  }, [activeId, markRead]);

  // Show typing indicator when auto-reply incoming
  useEffect(() => {
    if (!active) return;
    const lastMsg = active.messages[active.messages.length - 1];
    if (lastMsg?.from === myId) {
      setIsTyping(true);
      const t = setTimeout(() => setIsTyping(false), 3500);
      return () => clearTimeout(t);
    }
    setIsTyping(false);
  }, [active?.messages.length]);

  const handleSend = useCallback(() => {
    if (!text.trim() || !activeId) return;
    sendMessage(activeId, text.trim());
    setText('');
    inputRef.current?.focus();
  }, [text, activeId, sendMessage]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const totalUnread = threads.reduce((s, th) => s + th.unread, 0);

  const filteredThreads = threads.filter(th =>
    th.listingTitle.toLowerCase().includes(search.toLowerCase())
  );

  // ── Not logged in ──
  if (!user) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center p-6">
      <div className="w-20 h-20 bg-dz-green/10 rounded-3xl flex items-center justify-center">
        <MessageSquare size={36} className="text-dz-green"/>
      </div>
      <div>
        <h2 className="text-xl font-black text-foreground mb-2">Vos messages</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Connectez-vous pour voir vos conversations avec les vendeurs.
        </p>
      </div>
      <Link to="/auth" state={{ from: '/messages' }}
        className="px-6 py-3 bg-dz-green text-white font-black rounded-xl shadow-brand-md hover:bg-dz-green2 transition-colors">
        Se connecter
      </Link>
    </div>
  );

  return (
    <div className="h-[calc(100vh-56px)] flex bg-background">
      <div className="flex w-full max-w-5xl mx-auto border-x border-border shadow-xl overflow-hidden">

        {/* ══ SIDEBAR — thread list ══════════════════════════════════════ */}
        <aside className={`flex flex-col bg-card border-r border-border
          ${activeId ? 'hidden md:flex' : 'flex'}
          w-full md:w-80 shrink-0`}>

          {/* Header */}
          <div className="px-4 py-4 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-black text-foreground text-lg">Messages</h2>
                {totalUnread > 0 && (
                  <p className="text-xs text-dz-green font-bold">{totalUnread} non lu{totalUnread > 1 ? 's' : ''}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link to="/post"
                  className="p-2 bg-dz-green text-white rounded-xl hover:bg-dz-green2 transition-colors"
                  title="Déposer une annonce">
                  ✏️
                </Link>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une conversation…"
                className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-xl text-xs outline-none focus:border-dz-green transition-all"
              />
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
                <MessageSquare size={40} className="text-muted-foreground/20"/>
                <div>
                  <p className="font-bold text-foreground text-sm mb-1">Aucun message</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Contactez un vendeur depuis une annonce pour démarrer une conversation.
                  </p>
                </div>
                <Link to="/search"
                  className="px-4 py-2 bg-dz-green text-white font-bold text-xs rounded-xl hover:bg-dz-green2 transition-colors">
                  Voir les annonces
                </Link>
              </div>
            ) : (
              filteredThreads
                .sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0))
                .map(th => (
                  <ThreadItem
                    key={th.id}
                    thread={th}
                    isActive={th.id === activeId}
                    myId={myId}
                    onClick={() => setActiveId(th.id)}
                  />
                ))
            )}
          </div>
        </aside>

        {/* ══ MAIN — conversation ════════════════════════════════════════ */}
        <main className={`flex-1 flex flex-col min-w-0 ${!activeId ? 'hidden md:flex' : 'flex'}`}>
          {!active ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 bg-muted/20">
              <div className="w-24 h-24 bg-dz-green/5 rounded-3xl flex items-center justify-center border border-dz-green/10">
                <MessageSquare size={40} className="text-dz-green/40"/>
              </div>
              <div>
                <p className="font-black text-foreground mb-1">Sélectionnez une conversation</p>
                <p className="text-sm text-muted-foreground">
                  Choisissez une conversation dans la liste ou contactez un vendeur.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Conversation header ── */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-card shadow-sm shrink-0">
                <button
                  onClick={() => setActiveId(null)}
                  className="md:hidden p-1.5 hover:bg-muted rounded-xl transition-colors"
                  aria-label="Retour aux conversations"
                >
                  <ArrowLeft size={18}/>
                </button>

                {/* Listing image */}
                {active.listingImage ? (
                  <img src={active.listingImage} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0"/>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-dz-green/10 flex items-center justify-center shrink-0">🦊</div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground text-sm truncate">{active.listingTitle}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-dz-green rounded-full"/>
                    <p className="text-xs text-dz-green font-semibold">En ligne</p>
                    {active.listingPrice && active.listingPrice > 0 && (
                      <p className="text-xs text-muted-foreground ml-1">
                        · {active.listingPrice.toLocaleString()} DA
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/listing/${active.listingId}`}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                    title="Voir l'annonce"
                  >
                    <ExternalLink size={16}/>
                  </Link>
                  {active.listingTitle.includes(' ') && (
                    <a
                      href={`tel:`}
                      className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                      title="Appeler"
                    >
                      <Phone size={16}/>
                    </a>
                  )}
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(0,98,51,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

                {/* Date separator */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-border"/>
                  <span className="text-[10px] text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">Aujourd'hui</span>
                  <div className="flex-1 h-px bg-border"/>
                </div>

                {active.messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Démarrez la conversation !</p>
                  </div>
                )}

                {active.messages.map((msg, i) => {
                  const isMe  = msg.from === myId;
                  const showTime = i === active.messages.length - 1 ||
                    active.messages[i + 1]?.from !== msg.from;

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`group flex flex-col max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-dz-green text-white rounded-br-sm'
                            : 'bg-card border border-border text-foreground rounded-bl-sm'
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        {showTime && (
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTime(msg.ts)}
                            </span>
                            {isMe && (
                              <span className="text-[10px] text-muted-foreground">
                                {msg.read ? <CheckCheck size={12} className="text-dz-green"/> : <Check size={12}/>}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                      {[0, 150, 300].map(delay => (
                        <div key={delay} className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}/>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={endRef}/>
              </div>

              {/* ── Quick replies ── */}
              {active.messages.length <= 1 && (
                <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar bg-card border-t border-border/50 shrink-0">
                  {QUICK_REPLIES.map(r => (
                    <button key={r} onClick={() => setText(r)}
                      className="shrink-0 px-3 py-1.5 bg-muted hover:bg-dz-green/10 hover:text-dz-green border border-border hover:border-dz-green/30 rounded-full text-xs font-medium transition-all whitespace-nowrap">
                      {r}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input bar ── */}
              <div className="flex items-end gap-2 px-4 py-3 bg-card border-t border-border shrink-0">
                <div className="flex-1 relative bg-muted rounded-2xl border border-border focus-within:border-dz-green transition-all">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Écrivez un message…"
                    rows={1}
                    className="w-full bg-transparent px-4 py-3 text-sm outline-none resize-none max-h-32 leading-relaxed"
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                    text.trim()
                      ? 'bg-dz-green hover:bg-dz-green2 text-white shadow-brand-sm'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  aria-label="Envoyer le message"
                >
                  <Send size={17}/>
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;
