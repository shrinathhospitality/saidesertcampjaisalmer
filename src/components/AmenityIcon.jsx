import { FaConciergeBell, FaSpa, FaUtensils, FaCarSide, FaGlassCheers } from 'react-icons/fa';
import { MdEventSeat } from 'react-icons/md';

const map = {
  butler: FaConciergeBell,
  dining: FaUtensils,
  spa: FaSpa,
  car: FaCarSide,
  event: MdEventSeat,
  concierge: FaGlassCheers
};

export default function AmenityIcon({ name }) {
  const Icon = map[name] || FaConciergeBell;
  return <Icon />;
}
