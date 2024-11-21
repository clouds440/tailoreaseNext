import Link from "next/link";
const Logo = ({ classes, fontSize }) => {
  return (
    <div dir="ltr" className={`flex select-none ${classes}`}>
      <Link href={"/"}>
        <span className="flex">
          <h1 className={`font-bold ${fontSize} text-cyan-600`}>Tailor</h1>
          <h1 className={`font-bold ${fontSize} text-yellow-500`}>Ease</h1>
        </span>
      </Link>
    </div>
  );
};

export default Logo;
