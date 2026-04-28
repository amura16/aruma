const NavItem = ({ icon, active, badge, onClick }) => (
  <div 
    onClick={onClick}
    className={`relative flex items-center justify-center flex-1 py-2 cursor-pointer transition-all ${
      active ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:bg-gray-100 rounded-xl'
    }`}
  >
    {icon}
    {badge && (
      <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full ring-2 ring-white">
        {badge}
      </span>
    )}
  </div>
);

export default NavItem;