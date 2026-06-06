window.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("#site-nav");
  const toggle = document.querySelector(".nav-toggle");

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      header.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("nav-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        header.classList.remove("is-open");
        document.body.classList.remove("nav-open");
      });
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const videoPlayer = document.querySelector("[data-video-player]");

  if (videoPlayer) {
    const video = videoPlayer.querySelector("[data-video]");
    const playButtons = videoPlayer.querySelectorAll("[data-video-play]");
    const muteButton = videoPlayer.querySelector("[data-video-mute]");
    const fullscreenButton = videoPlayer.querySelector("[data-video-fullscreen]");
    const progress = videoPlayer.querySelector("[data-video-progress]");
    const time = videoPlayer.querySelector("[data-video-time]");
    let controlsTimer;

    const formatTime = (value) => {
      if (!Number.isFinite(value)) {
        return "0:00";
      }

      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    };

    const syncProgress = () => {
      const duration = video.duration || 0;
      const percent = duration ? (video.currentTime / duration) * 100 : 0;

      progress.value = String(percent);
      progress.style.setProperty("--video-progress", `${percent}%`);
      time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
    };

    const syncPlayState = () => {
      const isPlaying = !video.paused && !video.ended;

      videoPlayer.classList.toggle("is-playing", isPlaying);
      playButtons.forEach((button) => {
        button.setAttribute("aria-label", isPlaying ? "Pausar vídeo" : "Reproduzir vídeo");
      });

      window.clearTimeout(controlsTimer);

      if (isPlaying) {
        controlsTimer = window.setTimeout(() => {
          videoPlayer.classList.remove("is-controls-visible");
        }, 700);
        return;
      }

      videoPlayer.classList.add("is-controls-visible");
    };

    const syncMuteState = () => {
      const isMuted = video.muted || video.volume === 0;

      videoPlayer.classList.toggle("is-muted", isMuted);
      muteButton.setAttribute("aria-label", isMuted ? "Ativar som do vídeo" : "Silenciar vídeo");
    };

    const togglePlayback = () => {
      if (video.paused || video.ended) {
        if (video.ended) {
          video.currentTime = 0;
        }

        video.play().catch(syncPlayState);
        return;
      }

      video.pause();
    };

    const revealControls = () => {
      videoPlayer.classList.add("is-controls-visible");
      window.clearTimeout(controlsTimer);

      if (!video.paused && !video.ended) {
        controlsTimer = window.setTimeout(() => {
          videoPlayer.classList.remove("is-controls-visible");
        }, 1600);
      }
    };

    const setFallbackFullscreen = (isExpanded) => {
      videoPlayer.classList.toggle("is-faux-fullscreen", isExpanded);
      document.body.classList.toggle("video-expanded", isExpanded);
      fullscreenButton.setAttribute("aria-label", isExpanded ? "Sair da tela cheia" : "Ver em tela cheia");
      revealControls();
    };

    const blurPointerTarget = (event) => {
      if (event.detail > 0 && event.currentTarget instanceof HTMLElement) {
        event.currentTarget.blur();
      }
    };

    playButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        togglePlayback();
        blurPointerTarget(event);
      });
    });

    video.addEventListener("click", togglePlayback);
    videoPlayer.addEventListener("pointerenter", revealControls);
    videoPlayer.addEventListener("pointermove", revealControls);
    videoPlayer.addEventListener("pointerdown", revealControls);
    videoPlayer.addEventListener("focusin", revealControls);
    videoPlayer.addEventListener("pointerleave", () => {
      if (!video.paused && !video.ended) {
        videoPlayer.classList.remove("is-controls-visible");
      }
    });
    video.addEventListener("loadedmetadata", syncProgress);
    video.addEventListener("durationchange", syncProgress);
    video.addEventListener("timeupdate", syncProgress);
    video.addEventListener("play", syncPlayState);
    video.addEventListener("pause", syncPlayState);
    video.addEventListener("ended", syncPlayState);
    video.addEventListener("volumechange", syncMuteState);

    progress.addEventListener("input", () => {
      if (!video.duration) {
        return;
      }

      video.currentTime = (Number(progress.value) / 100) * video.duration;
      syncProgress();
    });

    muteButton.addEventListener("click", (event) => {
      video.muted = !video.muted;
      syncMuteState();
      blurPointerTarget(event);
    });

    fullscreenButton.addEventListener("click", async (event) => {
      if (videoPlayer.classList.contains("is-faux-fullscreen")) {
        setFallbackFullscreen(false);
        blurPointerTarget(event);
        return;
      }

      if (document.fullscreenElement) {
        await document.exitFullscreen();
        blurPointerTarget(event);
        return;
      }

      try {
        if (videoPlayer.requestFullscreen) {
          await videoPlayer.requestFullscreen();
          revealControls();
          blurPointerTarget(event);
          return;
        }
      } catch (error) {
        setFallbackFullscreen(true);
        blurPointerTarget(event);
        return;
      }

      if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }

      blurPointerTarget(event);
    });

    document.addEventListener("fullscreenchange", () => {
      fullscreenButton.setAttribute("aria-label", document.fullscreenElement ? "Sair da tela cheia" : "Ver em tela cheia");
      if (!document.fullscreenElement) {
        document.body.classList.remove("video-expanded");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && videoPlayer.classList.contains("is-faux-fullscreen")) {
        setFallbackFullscreen(false);
      }
    });

    syncProgress();
    syncPlayState();
    syncMuteState();
  }

  if (window.Swiper) {
    new Swiper(".services-swiper", {
      rewind: true,
      grabCursor: true,
      speed: 720,
      slidesPerView: 1.05,
      spaceBetween: 14,
      pagination: {
        el: ".services-swiper .swiper-pagination",
        clickable: true
      },
      navigation: {
        nextEl: ".carousel-button--next",
        prevEl: ".carousel-button--prev"
      },
      breakpoints: {
        680: {
          slidesPerView: 2,
          spaceBetween: 18
        },
        980: {
          slidesPerView: 3,
          spaceBetween: 22
        },
        1180: {
          slidesPerView: 3,
          spaceBetween: 22
        }
      }
    });

    new Swiper(".gallery-swiper", {
      loop: true,
      grabCursor: true,
      speed: 760,
      slidesPerView: 1.08,
      spaceBetween: 14,
      autoplay: {
        delay: 3600,
        disableOnInteraction: false
      },
      breakpoints: {
        680: {
          slidesPerView: 2.1,
          spaceBetween: 18
        },
        1080: {
          slidesPerView: 3,
          spaceBetween: 22
        }
      }
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  reveals.forEach((item) => revealObserver.observe(item));

  const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (motionAllowed && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    window.gsap.utils.toArray("[data-parallax-bg]").forEach((element) => {
      window.gsap.fromTo(
        element,
        { scale: 1.08, yPercent: -4 },
        {
          scale: 1.02,
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: element.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });

    window.gsap.to(".hero__brand", {
      y: -22,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }
});
