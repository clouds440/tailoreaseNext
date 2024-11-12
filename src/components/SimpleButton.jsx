function SimpleButton({
  onClick,
  btnText,
  type,
  extraclasses = "",
  icon = null,
}) {
  const primary =
    "bg-sky-500 bg-opacity-80 text-white hover:bg-sky-400 " + extraclasses;
  const simple =
    "bg-gray-100 text-black opacity-85 text-gray-800 hover:bg-gray-300 " +
    extraclasses;
  const danger = "bg-red-800 text-white hover:bg-rose-500 " + extraclasses;

  let style;
  switch (type) {
    case "primary":
    case "primary-submit":
      style = primary;
      break;
    case "danger":
      style = danger;
      break;
    default:
      style = simple;
  }

  return (
    <button
      type={type === "primary-submit" ? "submit" : "button"}
      className={`${style} flex items-center justify-center px-4 py-1 rounded-md duration-500 select-none`}
      onClick={onClick}
    >
      {icon && <span className="md:mr-2">{icon}</span>}
      {btnText}
    </button>
  );
}

export default SimpleButton;
