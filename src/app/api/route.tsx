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

// Fungsi untuk menghasilkan pola abstrak berdasarkan data
function generateAbstractPattern(data: string): { x1: number; y1: number; x2: number; y2: number; thickness: number }[] {
  const lines: { x1: number; y1: number; x2: number; y2: number; thickness: number }[] = [];
  const seed = data ? parseInt(data.slice(2, 10), 16) : 0; // Gunakan 8 karakter dari data sebagai seed
  const count = data ? Math.min(10, parseInt(data.slice(-2), 16) || 5) : 5; // Jumlah garis

  for (let i = 0; i < count; i++) {
    const angle = (seed + i * 72) % 360; // Distribusi sudut untuk pola abstrak
    const offset = (seed + i * 17) % 100; // Offset untuk variasi
    const x1 = 100 + (offset % 220); // Mulai dari sisi kiri
    const y1 = 20 + (offset % 104); // Variasi vertikal
    const x2 = x1 + 50 * Math.cos((angle * Math.PI) / 180); // Panjang garis
    const y2 = y1 + 50 * Math.sin((angle * Math.PI) / 180);
    const thickness = 2 + (seed % 5); // Ketebalan garis bervariasi
    lines.push({ x1, y1, x2, y2, thickness });
  }
  return lines;
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
    const pattern = generateAbstractPattern(data || "0x0"); // Pola abstrak dari data

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
            {/* SVG dengan pola abstrak */}
            <svg
              width="420"
              height="144"
              viewBox="0 0 420 144"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Gradien linier untuk latar belakang */}
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="420" y2="144">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="420" height="144" fill="url(#gradient)" />
              {/* Pola garis abstrak */}
              {pattern.map((line, index) => (
                <line
                  key={index}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={color}
                  strokeWidth={line.thickness}
                  strokeOpacity="0.7"
                />
              ))}
            </svg>

            {/* Teks dinamis dengan efek abstrak */}
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
                transform: "rotate(-5deg)", // Rotasi untuk efek abstrak
                boxShadow: "2px 2px 5px rgba(0,0,0,0.3)", // Bayangan
              }}
            >
              <p
                style={{
                  fontFamily: '"Inter"',
                  fontSize: data && data.length > 7 ? "40px" : "52px", // Font fleksibel
                  color: "white",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.5)", // Efek bayangan
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
