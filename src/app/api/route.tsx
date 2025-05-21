/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type BaseParams = {
  address: `0x${string}`;
  data?: string;
};

// Fungsi untuk menghasilkan warna dari hash alamat
function generateColorFromAddress(address: string): string {
  const hash = address.slice(2, 8); // Ambil 6 karakter untuk warna
  return `#${hash}`;
}

// Fungsi untuk menghasilkan pola dinamis berdasarkan data
function generatePattern(data: string): { x: number; y: number; size: number }[] {
  const points: { x: number; y: number; size: number }[] = [];
  const seed = data ? parseInt(data.slice(2, 10), 16) : 0; // Gunakan 8 karakter dari data sebagai seed
  const count = data ? Math.min(12, parseInt(data.slice(-2), 16) || 6) : 6; // Jumlah lingkaran

  for (let i = 0; i < count; i++) {
    const angle = (seed + i * 137.5) % 360; // Pola phyllotaxis
    const radius = 20 * Math.sqrt(i);
    const x = 210 + radius * Math.cos((angle * Math.PI) / 180); // Pusat di 420/2
    const y = 72 + radius * Math.sin((angle * Math.PI) / 180); // Pusat di 144/2
    const size = 5 + (seed % 8); // Ukuran lingkaran bervariasi
    points.push({ x, y, size });
  }
  return points;
}

export async function GET(request: NextRequest) {
  const searchParams = new URLSearchParams(request.url?.split("?")[1]);
  const { address, data } = Object.fromEntries(searchParams.entries()) as BaseParams;

  // Validasi alamat
  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json({ error: "valid address is required" }, { status: 400 });
  }

  // Ambil font Inter
  const inter = await fetch(
    new URL("../../assets/fonts/Inter-Bold.ttf", import.meta.url)
  )
    .then((res) => res.arrayBuffer())
    .catch((e) => {
      throw new Error("failed to fetch font: inter", e);
    });

  try {
    const color = generateColorFromAddress(address); // Warna dinamis dari alamat
    const pattern = generatePattern(data || "0x0"); // Pola dinamis dari data

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "white",
            padding: "0.5rem",
            borderRadius: "9999px",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: "4px",
              borderColor: color, // Border dinamis
              borderRadius: "9999px",
              padding: "0 2rem",
            }}
          >
            {/* SVG dengan pola dinamis */}
            <svg
              width="420"
              height="144"
              viewBox="0 0 420 144"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Latar belakang lingkaran transparan */}
              <circle cx="210" cy="72" r="60" fill={color} fillOpacity="0.2" />
              {/* Pola lingkaran dinamis */}
              {pattern.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={point.size}
                  fill={color}
                  fillOpacity="0.8"
                />
              ))}
            </svg>

            {/* Teks dinamis */}
            <div
              style={{
                display: "flex",
                background: color, // Latar belakang dinamis
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
                  fontSize: data && data.length > 7 ? "40px" : "52px", // Font fleksibel
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
