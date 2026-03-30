/**
 * Поведение: бургер-меню, плавный скролл по секциям, кнопка hero → форма,
 * маска телефона и заглушка отправки, год в подвале,
 * классы .reveal / .is-visible для анимации появления секций (см. style.css).
 */

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("main-nav");
  const navToggle = document.querySelector(".nav-toggle");

  const closeNav = () => {
    nav?.classList.remove("nav--open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Открыть меню");
  };

  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("nav--open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute(
      "aria-label",
      open ? "Закрыть меню" : "Открыть меню"
    );
  });

  document.querySelectorAll(".nav__link[data-target]").forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("data-target");
      if (!id) return;
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      closeNav();
    });
  });

  const heroBtn = document.querySelector(".hero-main__button");
  const visitBlock = document.getElementById("visit-form");
  if (heroBtn && visitBlock) {
    heroBtn.addEventListener("click", () => {
      visitBlock.scrollIntoView({ behavior: "smooth", block: "center" });
      visitBlock.querySelector("input[name='name']")?.focus();
    });
  }

  if (visitBlock) {
    const phone = visitBlock.querySelector("input[name='phone']");
    if (phone) {
      const formatRuPhone = (value) => {
        let d = value.replace(/\D/g, "");
        if (d.startsWith("8")) d = "7" + d.slice(1);
        if (!d.startsWith("7")) d = "7" + d;
        d = d.slice(0, 11);
        const a = d.slice(1, 4);
        const b = d.slice(4, 7);
        const c = d.slice(7, 9);
        const e = d.slice(9, 11);
        let s = "+7";
        if (a) s += ` (${a}`;
        if (a.length === 3) s += ")";
        if (b) s += ` ${b}`;
        if (c) s += `-${c}`;
        if (e) s += `-${e}`;
        return s;
      };

      phone.addEventListener("focus", () => {
        if (!phone.value) phone.value = "+7";
      });
      phone.addEventListener("input", () => {
        phone.value = formatRuPhone(phone.value);
      });
      phone.addEventListener("blur", () => {
        if (phone.value.replace(/\D/g, "").length <= 1) phone.value = "";
      });
    }

    const form = visitBlock.querySelector("form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Спасибо! Мы свяжемся с вами, чтобы подтвердить запись.");
      form.reset();
    });
  }

  const yearEl = document.querySelector(".footer__bottom-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Плавное появление секций и подвала при скролле (без JS контент остаётся видимым) */
  const revealTargets = document.querySelectorAll(
    "body > section:not(.hero), footer.footer"
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  if (revealTargets.length) {
    if (reduceMotion) {
      revealTargets.forEach((el) => el.classList.add("reveal", "is-visible"));
    } else {
      revealTargets.forEach((el) => el.classList.add("reveal"));
      const io = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
      );
      revealTargets.forEach((el) => io.observe(el));
      /* Уже в зоне видимости при загрузке — сразу показать, без кадра «пустоты» */
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        revealTargets.forEach((el) => {
          if (el.classList.contains("is-visible")) return;
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.92 && r.bottom > 0) {
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        });
      });
    }
  }
});

const SUPABASE_URL = "https://ukiqmcgfhqnkwilafisf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVraXFtY2dmaHFua3dpbGFmaXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDYxMzAsImV4cCI6MjA5MDQyMjEzMH0.QUrxWHJNfd-xSska0Pyh7lRSt77ubQzcbSCw2OrRESY";

const form = document.getElementById("booking-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    tour: formData.get("tour"),
    col: Number(formData.get("people")),
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("✅ Заявка успешно отправлена!");
      form.reset();
    } else {
      const errorText = await response.text();
      console.error(errorText);
      alert("❌ Ошибка при отправке");
    }
  } catch (error) {
    console.error(error);
    alert("❌ Ошибка соединения");
  }
});
