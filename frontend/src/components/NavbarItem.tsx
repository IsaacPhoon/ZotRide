interface NavbarItemProps {
    text: string;
    active: boolean;
}

const NavbarItem = ({ text, active }: NavbarItemProps) => {
  return (
    <div className={`flex rounded-full items-center justify-center h-[1.75rem] w-[7rem] ${active ? 'border border-black bg-white/50' : ''}`}>{text}</div>
  )
}

export default NavbarItem