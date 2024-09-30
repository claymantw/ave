/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type BaseParams = {
  address: `0x${string}`;
  data?: string;
};

export async function GET(request: NextRequest) {
  const searchParams = new URLSearchParams(request.url?.split("?")[1]);
  const { address, data } = Object.fromEntries(
    searchParams.entries()
  ) as BaseParams;

  if (!address)
    return NextResponse.json({ error: "address is required" }, { status: 400 });

  const inter = await fetch(
    new URL("../../assets/fonts/Inter-Bold.ttf", import.meta.url)
  )
    .then((res) => res.arrayBuffer())
    .catch((e) => {
      throw new Error("failed to fetch font: inter", e);
    });

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "white",
            padding: "0.5rem",
            borderRadius: "9999",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: "4px",
              borderColor: "black",
              borderRadius: "9999",
              padding: "0 2rem",
            }}
          >
            <svg
              width="52"
              height="62"
              viewBox="0 0 52 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.474 21.1364H32.0743V31.7045H21.474V21.1364Z"
                fill="black"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M46.7734 6.48182V11.4136H51.7202V51.2909H46.5615L46.5614 51.2886H30.3783V62H11.7218V57.0682H6.77496V18.4591H0.273438V0H18.7886V6.48182H46.7734ZM4.23088 14.6545H14.8312V3.94545H4.23088V14.6545ZM10.7324 21.1364V53.1261L21.4034 53.0523L21.4774 42.4136H42.816V10.4273H21.474V21.1364H10.7324Z"
                fill="black"
              />
            </svg>

            <div
              style={{
                display: "flex",
                background: "black",
                padding: "0.5rem 1rem",
                borderRadius: "1rem",
                height: "80px",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "1.5rem",
                flex: 1,
              }}
            >
              <p
                style={{
                  fontFamily: '"Inter"',
                  fontSize: "52px",
                  color: "white",
                }}
              >
                {(data || "0").substring(0, 7)}
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 420,
        height: 144,
        fonts: [
          {
            name: "Inter",
            data: inter,
            style: "normal",
            weight: 700,
          },
        ],
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
