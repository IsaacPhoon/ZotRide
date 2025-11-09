import RequestRideForm from "./RequestRideForm";
import HomeNavCards from "./HomeNavCards";
import JoinRides from "./JoinRides";

interface HomeProps {
  setActivePage: (
    page: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  ) => void;
}

const Home = ({ setActivePage }: HomeProps) => {
  return (
    <div className="bg-white text-black px-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-[2rem] pt-[4rem] space-x-[8rem]">
        <RequestRideForm />
        <div>
          <h1 className="text-5xl font-bold">
            An AI generated picture will go here
          </h1>
        </div>
      </div>
      <HomeNavCards setActivePage={setActivePage} />
      <JoinRides />
    </div>
  );
};

export default Home;
