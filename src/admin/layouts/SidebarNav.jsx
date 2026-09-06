import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from './navConfig.js';

export default function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section, i) => (
        <div key={i}>
          {section.title && (
            <p className="px-3 pb-2 text-[.65rem] font-bold uppercase tracking-[.2em] text-slate-400">{section.title}</p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon className="shrink-0 text-base" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
