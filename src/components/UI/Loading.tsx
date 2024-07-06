import { ReactComponent as LoadingSVG } from "../../icons/loading.svg";

export const Loading = () => {
  return (
    <div className="my-5 flex items-center justify-center">
      <LoadingSVG className="w-12 h-12" />
    </div>
  );
};

export default Loading;
