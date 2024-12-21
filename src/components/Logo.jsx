import Link from "next/link";
const Logo = ({ classes, fontSize }) => {
  return (
    <div className={`flex select-none ${classes}`}>
      <Link href={"/"}>
        <span className="flex">
          <img className="w-24" src="/graphics/logo.png" alt="This is the logo of the platform" />
        </span>
      </Link>
    </div>
  );
};

export default Logo;
