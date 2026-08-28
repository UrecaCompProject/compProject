import { Home, ClipboardList, Award, BotMessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

const NavIcon = ({
  menu,
  active = false,
}: {
  menu: { name: string; icon: string; navigation: string };
  active?: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`w-17.5 flex cursor-pointer flex-col items-center gap-1 ${active ? 'text-brand-primary' : 'text-fg-disabled'}`}
      onClick={() => navigate(menu.navigation)}
    >
      {menu.icon === 'Home' && <Home size={22} />}
      {menu.icon === 'ClipboardList' && <ClipboardList size={22} />}
      {menu.icon === 'Award' && <Award size={22} />}
      {menu.icon === 'BotMessageSquare' && <BotMessageSquare size={22} />}
      <div
        className={`text-[11px] text-center ${active ? 'font-bold' : 'font-medium'}`}
      >
        {menu.name}
      </div>
    </div>
  );
};

const isActive = (navigation: string, pathname: string) =>
  navigation === '/' ? pathname === '/' : pathname.startsWith(navigation);

export default function Navbar() {
  const { pathname } = useLocation();

  const menuItems = [
    { name: '홈', icon: 'Home', navigation: '/' },
    { name: '요금제', icon: 'ClipboardList', navigation: '/plan' },
    { name: '혜택/이벤트', icon: 'Award', navigation: '/event' },
  ];
  const chatMenu = {
    name: '챗봇',
    icon: 'BotMessageSquare',
    navigation: '/chat',
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-10 flex w-full -translate-x-1/2 justify-center gap-5 px-4">
      <div className="w-fit bg-white rounded-full shadow-shadow px-4 py-3 flex gap-4 items-center justify-center">
        {menuItems.map((menu) => (
          <NavIcon
            key={menu.name}
            menu={menu}
            active={isActive(menu.navigation, pathname)}
          />
        ))}
      </div>
      <div className="w-16 bg-white rounded-full shadow-shadow px-4 py-3 flex items-center justify-center">
        <NavIcon
          menu={chatMenu}
          active={isActive(chatMenu.navigation, pathname)}
        />
      </div>
    </div>
  );
}
