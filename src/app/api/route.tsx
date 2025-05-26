/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import path from "path";
import { readFile } from "fs/promises";

export const runtime = "edge";

type BaseParams = {
  address: `0x${string}`;
  network?: string; // Parameter untuk memilih jaringan
};

// Konfigurasi jaringan
const NETWORK_CONFIGS: Record<string, { contractAddress: string; rpcUrl: string }> = {
  mainnet: {
    contractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  },
  polygon: {
    contractAddress: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  },
  avalanche: {
    contractAddress: "0x63a72806098Bd3D9520cC43356dD78AFE5D386D9",
    rpcUrl: `https://avalanche-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  },
  optimism: {
    contractAddress: "0x76FB31fb4af56892A25e32cFC43De717950c9278",
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  },
  base: {
    contractAddress: "0xeA51d7853eEFb32b6ee06b1C12E6dcCA88Be0fFE",
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  },
};

// ABI minimal untuk kontrak ERC-20
const AAVE_ABI = [
  "function balanceOf(address account) view returns (uint256)"
];

// Fungsi untuk mendapatkan saldo AAVE
async function getAaveBalance(address: string, network: string = "mainnet"): Promise<string> {
  const config = NETWORK_CONFIGS[network] || NETWORK_CONFIGS.mainnet; // Default ke mainnet
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const aaveContract = new ethers.Contract(config.contractAddress, AAVE_ABI, provider);

  try {
    const balance = await aaveContract.balanceOf(address);
    return ethers.formatUnits(balance, 18); // AAVE memiliki 18 desimal
  } catch (error) {
    console.error(`Error fetching AAVE balance on ${network}:`, error);
    return "0"; // Fallback jika gagal
  }
}

// Fungsi untuk memetakan saldo AAVE ke nama file gambar
function getImageFromBalance(balance: string): string {
  const balanceNum = parseFloat(balance);
  if (balanceNum >= 1000) {
    return "/image/platinum.jpg"; // Saldo >= 1000 AAVE
  } else if (balanceNum >= 100) {
    return "/image/gold.jpg"; // Saldo 100-999 AAVE
  } else if (balanceNum > 0) {
    return "/image/bronze.jpg"; // Saldo 0.000000000000000001-99 AAVE
  } else {
    return "/image/noob.jpg"; // Saldo 0 AAVE
  }
}

export async function GET(request: NextRequest) {
  const searchParams = new URLSearchParams(request.url?.split("?")[1]);
  const { address, network } = Object.fromEntries(searchParams.entries()) as BaseParams;

  // Validasi alamat
  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json({ error: "valid address is required" }, { status: 400 });
  }

  try {
    // Ambil saldo AAVE dari jaringan yang dipilih
    const balance = await getAaveBalance(address, network);
    const imagePath = getImageFromBalance(balance);

    // Baca file gambar dari folder public
    const filePath = path.join(process.cwd(), "public", imagePath);
    const imageBuffer = await readFile(filePath);

    // Kembalikan gambar menggunakan ImageResponse
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "hsl(220, 20%, 10%)",
          }}
        >
          <img
            src={`data:image/png;base64,${imageBuffer.toString("base64")}`}
            alt="Generated Image"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ),
      {
        width: 1000,
        height: 1000,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Internal server error or image not found", { status: 500 });
  }
}
