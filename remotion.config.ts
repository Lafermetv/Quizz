import { Config } from '@remotion/cli/config';

// Réglages de rendu (qualité TikTok / Reels / Shorts)
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(18);
