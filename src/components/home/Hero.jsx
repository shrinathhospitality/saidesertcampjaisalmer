import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { FiArrowLeft, FiArrowRight, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useContent } from '../../context/ContentContext.jsx';

export default function Hero() {
  const { hotel, getPage } = useContent();
  const [active, setActive] = useState(0);
  const [swiper, setSwiper] = useState(null);
  // CMS-managed slides (editable at /admin/pages/page-home) take priority;
  // fall back to the bundled copy if the API is unreachable or has none yet.
  const homePage = getPage('/');
  const slides = homePage?.heroSlides?.length ? homePage.heroSlides : hotel.heroSlides || [];

  return (
    <section className="relative min-h-screen overflow-hidden bg-ink text-pearl">
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_75%_20%,rgba(216,178,110,.2),transparent_28%),linear-gradient(90deg,rgba(16,16,14,.92),rgba(16,16,14,.55)_48%,rgba(16,16,14,.18))]" />
      <div className="pointer-events-none absolute left-0 top-0 z-[3] hidden h-full w-24 border-r border-pearl/10 md:block">
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center gap-4 whitespace-nowrap text-[.62rem] font-bold uppercase tracking-[.42em] text-pearl/48">
          <span className="h-px w-16 bg-champagne/70" />
          Hero Slider
          <span className="h-px w-16 bg-champagne/70" />
        </div>
      </div>

      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        loop
        speed={1100}
        autoplay={{ delay: 5600, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        onSwiper={setSwiper}
        onRealIndexChange={(instance) => setActive(instance.realIndex)}
        className="absolute inset-0 h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="absolute inset-0">
              {slide.type === 'video' && slide.video ? (
                <video src={slide.video} poster={slide.image} muted loop playsInline autoPlay className="h-full w-full scale-105 object-cover" />
              ) : (
                <img src={slide.image} alt={slide.title} className="h-full w-full scale-105 object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
            </div>
            <div className="container-lux relative z-10 flex min-h-screen items-center pb-32 pt-24 lg:pb-48">
              <motion.div
                key={slide.title}
                initial={{ opacity: 0, y: 42 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .95, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-5xl"
              >
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <p className="text-xs font-bold uppercase tracking-[.45em] text-champagne">{slide.eyebrow}</p>
                  <span className="hidden h-px w-20 bg-champagne/60 sm:block" />
                  <span className="rounded-full border border-pearl/20 bg-ink/60 px-4 py-2 text-[.65rem] font-bold uppercase tracking-[.22em] text-pearl/70">
                    Slide {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                  </span>
                </div>
                <h1 className="font-display text-5xl font-semibold leading-[.9] text-balance md:text-7xl lg:text-8xl">{slide.title}</h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-pearl/74 md:text-xl">{slide.text}</p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                  <Link to="/rooms" className="button-gold">Explore Rooms <FiArrowRight /></Link>
                  <Link to="/packages" className="button-ghost">View Packages</Link>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="container-lux pointer-events-none absolute inset-x-0 bottom-20 z-10 hidden lg:block">
        <div className="pointer-events-auto ml-auto grid max-w-xl gap-4 rounded-[2rem] border border-pearl/15 bg-ink/90 p-4 shadow-glow">
          <div className="grid grid-cols-3 gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                onClick={() => swiper?.slideToLoop(index)}
                className={`group relative min-h-28 overflow-hidden rounded-[1.2rem] border text-left transition ${active === index ? 'border-champagne' : 'border-pearl/10 hover:border-pearl/35'}`}
                aria-label={`Show slide ${index + 1}: ${slide.title}`}
              >
                <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 font-display text-lg leading-none text-pearl">{slide.eyebrow}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-[.22em] text-pearl/62">
              <span className="inline-flex items-center gap-2"><FiMapPin className="text-champagne" />{hotel.location}</span>
              <span className="inline-flex items-center gap-2"><FiCalendar className="text-champagne" />Open year-round</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => swiper?.slidePrev()} className="grid h-11 w-11 place-items-center rounded-full border border-pearl/15 text-pearl transition hover:border-champagne hover:text-champagne" aria-label="Previous hero slide">
                <FiArrowLeft />
              </button>
              <button onClick={() => swiper?.slideNext()} className="grid h-11 w-11 place-items-center rounded-full border border-pearl/15 text-pearl transition hover:border-champagne hover:text-champagne" aria-label="Next hero slide">
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 text-xs font-bold uppercase tracking-[.32em] text-pearl/55 md:flex lg:left-[20%]">
        <span className="h-px w-16 bg-pearl/30" /> Scroll to discover <span className="h-px w-16 bg-pearl/30" />
      </div>
    </section>
  );
}
