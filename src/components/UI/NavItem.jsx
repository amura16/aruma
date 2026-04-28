const NavItem = ({ icon, active, badge }) => (
  <div className={`relative flex-1 flex justify-center py-2 cursor-pointer border-b-4 transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:rounded-lg'}`}>
    {icon}
    {badge && (
      <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
        {badge}
      </span>
    )}
  </div>
);

export default NavItem;