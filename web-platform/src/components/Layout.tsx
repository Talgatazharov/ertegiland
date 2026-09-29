
﻿import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Menu, X, Sparkles } from "lucide-react";
import { hasStorageWarning } from "../services/storageService";
const nav = [
  ["/", "Басты бет"],
  ["/characters", "Кейіпкерлер"],
  ["/story", "Ертегіні жалғастыр"],
  ["/create", "Ертегі құрастыр"],
  ["/quiz", "Ойын"],
  ["/library", "Менің кітабым"],
  ["/about", "Жоба туралы"],
];
export function Layout() {
  const [open, setOpen] = useState(false);
  const [warning, setWarning] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (hasStorageWarning()) setWarning(true);
    const handler = () => setWarning(true);
    window.addEventListener("storage-warning", handler);
    return () => window.removeEventListener("storage-warning", handler);
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Мазмұнға өту
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <BookOpen size={24} />
            </span>
            <span>
              Ертегі<span className="brand-gold">Land</span>
              <small>ҚИЯЛЫҢНАН БАСТАЛАДЫ</small>
            </span>
          </Link>
          <button
            className="menu-button"
            aria-label={open ? "Мәзірді жабу" : "Мәзірді ашу"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav className={open ? "nav open" : "nav"} aria-label="Негізгі мәзір">
            {nav.map(([url, label]) => (
              <NavLink key={url} to={url} end={url === "/"}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/library"
            className="header-star"
            aria-label="Менің жетістіктерім"
          >
            <Sparkles size={20} />
          </Link>
        </div>
      </header>
      
      {warning && (
        <div className="notice storage-notice" role="alert">
          Браузер деректерді сақтай алмады немесе бұрынғы дерек бұзылған.
          Кітапты жоғалтпау үшін PDF ретінде сақта.
          <button className="text-button" onClick={() => setWarning(false)}>
            Жабу
          </button>
        </div>
      )}
      <main id="main">
        <Outlet />
      </main>
      <footer>
        <Link to="/" className="footer-brand">
          <BookOpen size={19} /> ЕртегіLand
        </Link>
        <span>Ұлттық мұра. Жаңа қиял. Сенің ертегің.</span>
        <Link to="/about">
          4-сыныпқа арналған білім әлемі <span>✦</span>
        </Link>
      </footer>
    </>
  );
}
