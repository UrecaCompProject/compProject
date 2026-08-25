import { Home, ClipboardList, Award, BotMessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

type MenuItem = {
  name: string;
  icon: string;
  navigation?: string;
  onClick?: () => void;
};

const NavIcon = ({
  menu,
  active = false,
}: {
  menu: MenuItem;
  active?: boolean;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (menu.onClick) {
      menu.onClick();
      return;
    }

    if (menu.navigation) {
      navigate(menu.navigation);
    }
  };

  return (
    <button
      type="button"
      className={`w-17.5 flex cursor-pointer flex-col items-center gap-1 ${active ? 'text-brand-primary' : 'text-fg-disabled'}`}
      onClick={handleClick}
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
    </button>
  );
};

const isActive = (navigation: string, pathname: string) =>
  navigation === '/' ? pathname === '/' : pathname.startsWith(navigation);

type NavbarProps = {
  rewardOpen: boolean;
  onRewardClick: () => void;
};

export default function Navbar({ rewardOpen, onRewardClick }: NavbarProps) {
  const { pathname } = useLocation();

  const menuItems: MenuItem[] = [
    { name: '홈', icon: 'Home', navigation: '/' },
    { name: '요금제', icon: 'ClipboardList', navigation: '/plan' },
    { name: '혜택/이벤트', icon: 'Award', onClick: onRewardClick },
  ];
  const chatMenu: MenuItem = {
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
            active={
              menu.name === '혜택/이벤트'
                ? rewardOpen
                : isActive(menu.navigation ?? '', pathname)
            }
          />
        ))}
      </div>
      <div className="w-16 bg-white rounded-full shadow-shadow px-4 py-3 flex items-center justify-center">
        <NavIcon
          menu={chatMenu}
          active={isActive(chatMenu.navigation ?? '', pathname)}
        />
      </div>
    </div>
  );
}
