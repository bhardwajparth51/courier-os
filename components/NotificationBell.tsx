"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Archive, ShieldAlert, Package, Landmark, Users, Cpu, ArrowRight, X, ExternalLink } from "lucide-react";

type Category = "ALL" | "OPERATIONS" | "FINANCE" | "CRM" | "SECURITY" | "SYSTEM";

const CATEGORY_ICONS: Record<string, any> = {
  OPERATIONS: Package,
  FINANCE: Landmark,
  CRM: Users,
  SECURITY: ShieldAlert,
  SYSTEM: Cpu,
};

const PRIORITY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  CRITICAL: { bg: "#FEF2F2", color: "#DC2626", label: "Critical" },
  HIGH:     { bg: "#FFF7ED", color: "#C2410C", label: "High" },
  MEDIUM:   { bg: "#EFF6FF", color: "#1D4ED8", label: "Medium" },
  LOW:      { bg: "#F3F4F6", color: "#4B5563", label: "Low" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [category, setCategory] = useState<Category>("ALL");
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ left: number; top?: number; bottom?: number }>({ left: 250, bottom: 80 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = async () => {
    try {
      const catParam = category !== "ALL" ? `?category=${category}` : "";
      const res = await fetch(`/api/notifications${catParam}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error("[NotificationBell] fetch error", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [category]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopover = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate fixed position to prevent sidebar clipping
      const isNearBottom = rect.top > viewportHeight / 2;
      const leftPos = Math.max(10, Math.min(rect.left, viewportWidth - 440));

      if (isNearBottom) {
        setPopoverPos({
          left: leftPos,
          bottom: Math.max(10, viewportHeight - rect.top + 8),
        });
      } else {
        setPopoverPos({
          left: leftPos,
          top: Math.min(rect.bottom + 8, viewportHeight - 500),
        });
      }
    }
    setOpen(!open);
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    fetchNotifications();
  };

  const archive = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive", id }),
    });
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    fetchNotifications();
  };

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      markRead(n.id);
    }
    setSelectedNotification(n);
  };

  const fmtTime = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div style={{ position: "relative", display: "inline-block" }} ref={containerRef}>
        {/* Bell Button */}
        <button
          ref={buttonRef}
          onClick={togglePopover}
          style={{
            position: "relative",
            width: 38,
            height: 38,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: open ? "var(--bg-muted)" : "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
          title="Notifications"
        >
          <Bell size={18} color="var(--text-secondary)" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: "var(--brand-red)",
              color: "white",
              fontSize: 10.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 0 0 2px white",
            }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Popover Dropdown (Fixed Portal to avoid sidebar clipping) */}
        {open && (
          <div style={{
            position: "fixed",
            left: popoverPos.left,
            ...(popoverPos.top !== undefined ? { top: popoverPos.top } : {}),
            ...(popoverPos.bottom !== undefined ? { bottom: popoverPos.bottom } : {}),
            width: 420,
            maxHeight: 520,
            background: "white",
            borderRadius: 14,
            border: "1px solid var(--border)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeIn 0.15s ease-out",
          }}>
            {/* Header */}
            <div style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#FAFAFA",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>
                  Communication Center
                </span>
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: "#FEF2F2",
                    color: "#DC2626",
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--brand-red)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div style={{
              display: "flex",
              gap: 4,
              padding: "8px 12px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "#F8FAFC",
              overflowX: "auto",
            }}>
              {(["ALL", "OPERATIONS", "FINANCE", "CRM", "SECURITY", "SYSTEM"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: category === cat ? "white" : "transparent",
                    color: category === cat ? "var(--text-primary)" : "var(--text-muted)",
                    fontSize: 11,
                    fontWeight: category === cat ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: category === cat ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* List Content */}
            <div style={{ flex: 1, overflowY: "auto", maxHeight: 380 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <Bell size={28} color="var(--text-subtle)" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>No notifications found</p>
                  <p style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2 }}>You're all caught up!</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const IconComp = CATEGORY_ICONS[n.category] || Package;
                  const priority = PRIORITY_BADGE[n.priority] || PRIORITY_BADGE.MEDIUM;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--border-subtle)",
                        background: n.isRead ? "white" : "#F8FAFC",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? "white" : "#F8FAFC")}
                    >
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: priority.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                        <IconComp size={15} color={priority.color} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>
                            {n.title}
                          </p>
                          <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {fmtTime(n.createdAt)}
                          </span>
                        </div>

                        <p style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1.4,
                          marginBottom: 6,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {n.message}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: priority.bg,
                            color: priority.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}>
                            {priority.label}
                          </span>

                          <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                            {n.link && (
                              <Link href={n.link} onClick={() => setOpen(false)} style={{ fontSize: 11, fontWeight: 600, color: "var(--brand-red)", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                                View <ArrowRight size={11} />
                              </Link>
                            )}
                            {!n.isRead && (
                              <button
                                onClick={() => markRead(n.id)}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                title="Mark as read"
                              >
                                <Check size={13} color="var(--text-muted)" />
                              </button>
                            )}
                            <button
                              onClick={() => archive(n.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                              title="Archive"
                            >
                              <Archive size={12} color="var(--text-subtle)" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 16px",
              background: "#F8FAFC",
              borderTop: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}>
              <Link
                href="/owner/settings/notifications"
                onClick={() => setOpen(false)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                Configure Notification Templates & Channels →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Detail Popup Modal */}
      {selectedNotification && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}>
          <div style={{
            background: "white",
            borderRadius: 16,
            width: "90%",
            maxWidth: 520,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            overflow: "hidden",
            animation: "fadeIn 0.2s ease-out",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              background: "#F8FAFC",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {(() => {
                  const IconComp = CATEGORY_ICONS[selectedNotification.category] || Package;
                  const priority = PRIORITY_BADGE[selectedNotification.priority] || PRIORITY_BADGE.MEDIUM;
                  return (
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: priority.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <IconComp size={20} color={priority.color} />
                    </div>
                  );
                })()}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: (PRIORITY_BADGE[selectedNotification.priority] || PRIORITY_BADGE.MEDIUM).bg,
                      color: (PRIORITY_BADGE[selectedNotification.priority] || PRIORITY_BADGE.MEDIUM).color,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}>
                      {(PRIORITY_BADGE[selectedNotification.priority] || PRIORITY_BADGE.MEDIUM).label} Priority
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "#E2E8F0",
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}>
                      {selectedNotification.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>
                    {selectedNotification.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748B",
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              <p style={{
                fontSize: 13.5,
                color: "#334155",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                marginBottom: 16,
              }}>
                {selectedNotification.message}
              </p>

              <div style={{
                padding: "12px 14px",
                borderRadius: 8,
                background: "#F1F5F9",
                fontSize: 12,
                color: "#64748B",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span>Received: {new Date(selectedNotification.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                <span style={{ fontWeight: 600, color: selectedNotification.isRead ? "#16A34A" : "#D97706" }}>
                  {selectedNotification.isRead ? "✓ Read" : "Unread"}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px",
              background: "#F8FAFC",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <button
                onClick={() => archive(selectedNotification.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  background: "white",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Archive size={14} /> Archive
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                {selectedNotification.link && (
                  <Link
                    href={selectedNotification.link}
                    onClick={() => {
                      setSelectedNotification(null);
                      setOpen(false);
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: "var(--brand-red)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "white",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    Open Page <ExternalLink size={14} />
                  </Link>
                )}
                <button
                  onClick={() => setSelectedNotification(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    background: "white",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#0F172A",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
