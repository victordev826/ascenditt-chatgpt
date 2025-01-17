import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black ">
      <div className="flex min-h-screen overflow-hidden flex-col justify-center items-center px-20 py-72 text-base font-medium leading-relaxed text-white max-md:px-5 max-md:py-24">
        <div className="flex flex-col items-center max-w-full w-[316px]">
          <Image src="ascenditt-logo.svg" width={150} height={150} alt="logo" />
          <div className="mt-5 text-center">Welcome to Argoss</div>

          <div className="flex gap-3 mt-7 max-w-full text-sm leading-loose text-center w-[153px]">
            <Link
              className="overflow-hidden px-2 py-2 bg-teal-600 rounded"
              href='/sign-in'
            >
              Sign In
            </Link>
            <Link
              className="overflow-hidden px-2 py-2 bg-teal-600 rounded"
              href='/sign-up'
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
