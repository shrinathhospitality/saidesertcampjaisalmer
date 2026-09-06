import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

export default function FAQ({ items }) {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-4">
      {items.map((item, index) => (
        <div key={item.question} className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-pearl">
          <button onClick={() => setActive(active === index ? -1 : index)} className="flex w-full items-center justify-between gap-6 p-5 text-left">
            <span className="font-display text-2xl font-semibold">{item.question}</span>
            <FiPlus className={`shrink-0 text-champagne transition ${active === index ? 'rotate-45' : ''}`} />
          </button>
          <div className={`grid transition-all duration-500 ${active === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <p className="px-5 pb-5 text-sm leading-7 text-ink/62">{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
