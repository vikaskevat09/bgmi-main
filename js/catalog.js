/**
 * Catalog — single source of truth (client).
 *
 * Cover images: the UI loads assets/games/<id>.(png|jpg|webp|svg) in that order
 * via window.coverHTML(). Drop your LICENSED logo/cover files into
 * assets/games/ using the game id as the filename (e.g. free-fire.png) and they
 * appear automatically. Generated .svg placeholders are the fallback.
 *
 * Prices are whole INR. The backend (server/catalog.js) re-computes the
 * authoritative amount from the same SKUs at order time, so the client can
 * never dictate the price.
 */
window.CATALOG = {
  categories: [
    { key: 'all',       label: 'All' },
    { key: 'battle',    label: 'Battle Royale' },
    { key: 'moba',      label: 'MOBA' },
    { key: 'shooter',   label: 'Shooter' },
    { key: 'adventure', label: 'Adventure' },
    { key: 'strategy',  label: 'Strategy' },
  ],

  games: [
    { id: 'free-fire', name: 'Free Fire', publisher: 'Garena', category: 'battle',
      badge: 'HOT', currency: 'Diamonds', region: 'India', idLabel: 'Player ID',
      denoms: [
        { sku: 'free-fire-100',  label: '100 + 10 Diamonds',     bonus: '',           price: 80 },
        { sku: 'free-fire-310',  label: '310 + 31 Diamonds',     bonus: 'Popular',    price: 240 },
        { sku: 'free-fire-520',  label: '520 + 62 Diamonds',     bonus: '',           price: 400 },
        { sku: 'free-fire-1060', label: '1060 + 159 Diamonds',   bonus: '',           price: 799 },
        { sku: 'free-fire-2180', label: '2180 + 436 Diamonds',   bonus: 'Best value', price: 1600 },
        { sku: 'free-fire-5600', label: '5600 + 1400 Diamonds',  bonus: 'Mega pack',  price: 3999 },
      ] },
    { id: 'bgmi', name: 'BGMI', publisher: 'Krafton', category: 'battle',
      badge: 'POPULAR', currency: 'UC', region: 'India', idLabel: 'Character ID',
      denoms: [
        { sku: 'bgmi-60',   label: '60 + 10 UC',      bonus: '',           price: 75 },
        { sku: 'bgmi-325',  label: '325 + 33 UC',     bonus: 'Popular',    price: 419 },
        { sku: 'bgmi-660',  label: '660 + 79 UC',     bonus: '',           price: 799 },
        { sku: 'bgmi-1800', label: '1800 + 270 UC',   bonus: '',           price: 1950 },
        { sku: 'bgmi-3850', label: '3850 + 770 UC',   bonus: 'Best value', price: 3999 },
        { sku: 'bgmi-8100', label: '8100 + 2025 UC',  bonus: 'Mega pack',  price: 7999 },
      ] },
    { id: 'pubg-mobile', name: 'PUBG Mobile', publisher: 'Krafton / Tencent', category: 'battle',
      badge: '', currency: 'UC', region: 'Global', idLabel: 'Character ID',
      denoms: [
        { sku: 'pubg-mobile-60',   label: '60 + 10 UC',      bonus: '',           price: 75 },
        { sku: 'pubg-mobile-325',  label: '325 + 33 UC',     bonus: 'Popular',    price: 419 },
        { sku: 'pubg-mobile-660',  label: '660 + 79 UC',     bonus: '',           price: 799 },
        { sku: 'pubg-mobile-1800', label: '1800 + 270 UC',   bonus: '',           price: 1950 },
        { sku: 'pubg-mobile-3850', label: '3850 + 770 UC',   bonus: 'Best value', price: 3999 },
        { sku: 'pubg-mobile-8100', label: '8100 + 2025 UC',  bonus: 'Mega pack',  price: 7999 },
      ] },
    { id: 'mobile-legends', name: 'Mobile Legends: Bang Bang', publisher: 'Moonton', category: 'moba',
      badge: '', currency: 'Diamonds', region: 'Global', idLabel: 'User ID',
      denoms: [
        { sku: 'mobile-legends-86',   label: '86 + 10 Diamonds',     bonus: '',           price: 99 },
        { sku: 'mobile-legends-172',  label: '172 + 17 Diamonds',    bonus: 'Popular',    price: 189 },
        { sku: 'mobile-legends-257',  label: '257 + 31 Diamonds',    bonus: '',           price: 279 },
        { sku: 'mobile-legends-706',  label: '706 + 106 Diamonds',   bonus: '',           price: 749 },
        { sku: 'mobile-legends-1412', label: '1412 + 282 Diamonds',  bonus: 'Best value', price: 1499 },
        { sku: 'mobile-legends-2195', label: '2195 + 549 Diamonds',  bonus: 'Mega pack',  price: 2299 },
      ] },
    { id: 'genshin-impact', name: 'Genshin Impact', publisher: 'HoYoverse', category: 'adventure',
      badge: 'NEW', currency: 'Genesis Crystals', region: 'Asia', idLabel: 'UID',
      denoms: [
        { sku: 'genshin-impact-60',   label: '60 + 10 Crystals',      bonus: '',           price: 89 },
        { sku: 'genshin-impact-330',  label: '330 + 33 Crystals',     bonus: 'Popular',    price: 449 },
        { sku: 'genshin-impact-1090', label: '1090 + 131 Crystals',   bonus: '',           price: 1299 },
        { sku: 'genshin-impact-2240', label: '2240 + 336 Crystals',   bonus: '',           price: 2599 },
        { sku: 'genshin-impact-3880', label: '3880 + 776 Crystals',   bonus: 'Best value', price: 3999 },
        { sku: 'genshin-impact-8080', label: '8080 + 2020 Crystals',  bonus: 'Mega pack',  price: 7499 },
      ] },
    { id: 'cod-mobile', name: 'Call of Duty: Mobile', publisher: 'Activision / Garena', category: 'shooter',
      badge: '', currency: 'CP', region: 'Global', idLabel: 'Open ID',
      denoms: [
        { sku: 'cod-mobile-80',    label: '80 + 10 CP',       bonus: '',           price: 75 },
        { sku: 'cod-mobile-400',   label: '400 + 40 CP',      bonus: 'Popular',    price: 389 },
        { sku: 'cod-mobile-800',   label: '800 + 96 CP',      bonus: '',           price: 759 },
        { sku: 'cod-mobile-2000',  label: '2000 + 300 CP',    bonus: '',           price: 1799 },
        { sku: 'cod-mobile-5000',  label: '5000 + 1000 CP',   bonus: 'Best value', price: 3999 },
        { sku: 'cod-mobile-10800', label: '10800 + 2700 CP',  bonus: 'Mega pack',  price: 7999 },
      ] },
    { id: 'valorant', name: 'Valorant', publisher: 'Riot Games', category: 'shooter',
      badge: '', currency: 'VP', region: 'Global', idLabel: 'Riot ID',
      denoms: [
        { sku: 'valorant-475',   label: '475 + 48 VP',     bonus: '',           price: 399 },
        { sku: 'valorant-1000',  label: '1000 + 100 VP',   bonus: 'Popular',    price: 799 },
        { sku: 'valorant-2050',  label: '2050 + 246 VP',   bonus: '',           price: 1599 },
        { sku: 'valorant-3650',  label: '3650 + 548 VP',   bonus: '',           price: 2799 },
        { sku: 'valorant-5350',  label: '5350 + 1070 VP',  bonus: 'Best value', price: 3999 },
        { sku: 'valorant-11000', label: '11000 + 2750 VP', bonus: 'Mega pack',  price: 7999 },
      ] },
    { id: 'clash-of-clans', name: 'Clash of Clans', publisher: 'Supercell', category: 'strategy',
      badge: '', currency: 'Gems', region: 'Global', idLabel: 'Player Tag',
      denoms: [
        { sku: 'clash-of-clans-80',    label: '80 + 10 Gems',       bonus: '',           price: 79 },
        { sku: 'clash-of-clans-500',   label: '500 + 50 Gems',      bonus: 'Popular',    price: 399 },
        { sku: 'clash-of-clans-1200',  label: '1200 + 144 Gems',    bonus: '',           price: 899 },
        { sku: 'clash-of-clans-2500',  label: '2500 + 375 Gems',    bonus: '',           price: 1799 },
        { sku: 'clash-of-clans-6500',  label: '6500 + 1300 Gems',   bonus: 'Best value', price: 3999 },
        { sku: 'clash-of-clans-14000', label: '14000 + 3500 Gems',  bonus: 'Mega pack',  price: 7999 },
      ] },
    { id: 'clash-royale', name: 'Clash Royale', publisher: 'Supercell', category: 'strategy',
      badge: '', currency: 'Gems', region: 'Global', idLabel: 'Player Tag',
      denoms: [
        { sku: 'clash-royale-80',    label: '80 + 10 Gems',       bonus: '',           price: 79 },
        { sku: 'clash-royale-500',   label: '500 + 50 Gems',      bonus: 'Popular',    price: 399 },
        { sku: 'clash-royale-1200',  label: '1200 + 144 Gems',    bonus: '',           price: 899 },
        { sku: 'clash-royale-2500',  label: '2500 + 375 Gems',    bonus: '',           price: 1799 },
        { sku: 'clash-royale-6500',  label: '6500 + 1300 Gems',   bonus: 'Best value', price: 3999 },
        { sku: 'clash-royale-14000', label: '14000 + 3500 Gems',  bonus: 'Mega pack',  price: 7999 },
      ] },
    { id: 'honkai-star-rail', name: 'Honkai: Star Rail', publisher: 'HoYoverse', category: 'adventure',
      badge: 'NEW', currency: 'Oneiric Shards', region: 'Asia', idLabel: 'UID',
      denoms: [
        { sku: 'honkai-star-rail-60',   label: '60 + 10 Shards',      bonus: '',           price: 89 },
        { sku: 'honkai-star-rail-330',  label: '330 + 33 Shards',     bonus: 'Popular',    price: 449 },
        { sku: 'honkai-star-rail-1090', label: '1090 + 131 Shards',   bonus: '',           price: 1299 },
        { sku: 'honkai-star-rail-2240', label: '2240 + 336 Shards',   bonus: '',           price: 2599 },
        { sku: 'honkai-star-rail-3880', label: '3880 + 776 Shards',   bonus: 'Best value', price: 3999 },
        { sku: 'honkai-star-rail-8080', label: '8080 + 2020 Shards',  bonus: 'Mega pack',  price: 7499 },
      ] },
    { id: 'wild-rift', name: 'LoL: Wild Rift', publisher: 'Riot Games', category: 'moba',
      badge: '', currency: 'Wild Cores', region: 'Global', idLabel: 'Riot ID',
      denoms: [
        { sku: 'wild-rift-225',  label: '225 + 23 Cores',     bonus: '',           price: 299 },
        { sku: 'wild-rift-525',  label: '525 + 53 Cores',     bonus: 'Popular',    price: 699 },
        { sku: 'wild-rift-1075', label: '1075 + 129 Cores',   bonus: '',           price: 1399 },
        { sku: 'wild-rift-2195', label: '2195 + 329 Cores',   bonus: '',           price: 2799 },
        { sku: 'wild-rift-3750', label: '3750 + 750 Cores',   bonus: 'Best value', price: 4599 },
        { sku: 'wild-rift-7800', label: '7800 + 1950 Cores',  bonus: 'Mega pack',  price: 8999 },
      ] },
    { id: 'pokemon-unite', name: 'Pokémon UNITE', publisher: 'The Pokémon Company', category: 'moba',
      badge: '', currency: 'Aeos Gems', region: 'Global', idLabel: 'Trainer ID',
      denoms: [
        { sku: 'pokemon-unite-60',   label: '60 + 10 Aeos Gems',     bonus: '',           price: 79 },
        { sku: 'pokemon-unite-250',  label: '250 + 25 Aeos Gems',    bonus: 'Popular',    price: 319 },
        { sku: 'pokemon-unite-490',  label: '490 + 59 Aeos Gems',    bonus: '',           price: 599 },
        { sku: 'pokemon-unite-1000', label: '1000 + 150 Aeos Gems',  bonus: '',           price: 1199 },
        { sku: 'pokemon-unite-2525', label: '2525 + 505 Aeos Gems',  bonus: 'Best value', price: 2999 },
        { sku: 'pokemon-unite-5275', label: '5275 + 1319 Aeos Gems', bonus: 'Mega pack',  price: 5999 },
      ] },
  ],

  // Games that need a server/zone field in addition to the player ID.
  needsServer: { 'mobile-legends': true, 'genshin-impact': true, 'honkai-star-rail': true },

  /**
   * Per-game ID format rules used for client-side validation when live API
   * verification isn't available (or as a pre-check before calling it).
   *  re      : RegExp the Player ID must match
   *  example : shown as a hint/placeholder
   *  serverRe: (optional) RegExp the server/zone field must match
   */
  idRules: {
    'free-fire':        { re: /^\d{8,12}$/,            example: 'e.g. 1194485231' },
    'bgmi':             { re: /^\d{8,12}$/,            example: 'e.g. 5123456789' },
    'pubg-mobile':      { re: /^\d{8,12}$/,            example: 'e.g. 5123456789' },
    'mobile-legends':   { re: /^\d{6,12}$/,            example: 'e.g. 123456789', serverRe: /^\d{3,6}$/ },
    'genshin-impact':   { re: /^\d{9}$/,               example: '9-digit UID', serverRe: /^[A-Za-z_]{2,10}$/ },
    'honkai-star-rail': { re: /^\d{9}$/,               example: '9-digit UID', serverRe: /^[A-Za-z_]{2,10}$/ },
    'cod-mobile':       { re: /^[A-Za-z0-9]{6,20}$/,   example: 'your Open ID' },
    'valorant':         { re: /^[^#]{3,16}#[A-Za-z0-9]{3,5}$/, example: 'Name#TAG' },
    'wild-rift':        { re: /^[^#]{3,16}#[A-Za-z0-9]{3,5}$/, example: 'Name#TAG' },
    'clash-of-clans':   { re: /^#?[A-Za-z0-9]{6,12}$/, example: '#ABC123XYZ' },
    'clash-royale':     { re: /^#?[A-Za-z0-9]{6,12}$/, example: '#ABC123XYZ' },
    'pokemon-unite':    { re: /^\d{9,16}$/,            example: 'your Trainer ID' },
  },

  validateId(id, playerId, serverId) {
    const rule = this.idRules[id];
    const game = this.find(id);
    const needsServer = !!this.needsServer[id];
    if (!rule) return { ok: !!playerId, message: playerId ? '' : 'Please enter your ID.' };
    if (!rule.re.test(playerId)) {
      return { ok: false, message: `That ${game ? game.idLabel : 'ID'} doesn't look right (${rule.example}).` };
    }
    if (needsServer) {
      if (!serverId) return { ok: false, message: 'This game needs a Server/Zone ID.' };
      if (rule.serverRe && !rule.serverRe.test(serverId)) {
        return { ok: false, message: 'That server/zone value doesn\'t look right.' };
      }
    }
    return { ok: true, message: '' };
  },

  coverBase(id) { return `assets/games/${id}`; },
  cover(id) { return `assets/games/${id}.svg`; },
  find(id) { return this.games.find(g => g.id === id); },
  findSku(sku) {
    for (const g of this.games) {
      const d = g.denoms.find(x => x.sku === sku);
      if (d) return { game: g, denom: d };
    }
    // Also search vouchers (treated like a pseudo-game for the cart).
    const v = this.vouchers.find(x => x.sku === sku);
    if (v) {
      return {
        game: { id: 'voucher', name: v.name, publisher: 'TopUpWorld', idLabel: 'Email', coverId: v.coverId || 'voucher' },
        denom: { sku: v.sku, label: v.label, bonus: v.bonus || '', price: v.price },
        isVoucher: true,
      };
    }
    return null;
  },

  // ===== Vouchers (prepaid credit / gift cards) — purchasable like games =====
  vouchers: [
    { sku: 'vch-100',  name: 'TopUpWorld Credit', label: '₹100 Credit',  price: 100,  bonus: 'Use on any game', grad: 'linear-gradient(135deg,#ff6a00,#c1121f)' },
    { sku: 'vch-250',  name: 'TopUpWorld Credit', label: '₹250 Credit',  price: 250,  bonus: 'Popular',         grad: 'linear-gradient(135deg,#1d1d1f,#ff6a00)' },
    { sku: 'vch-500',  name: 'TopUpWorld Credit', label: '₹500 Credit',  price: 500,  bonus: 'Best value',      grad: 'linear-gradient(135deg,#141414,#3a3a3a)' },
    { sku: 'vch-1000', name: 'TopUpWorld Credit', label: '₹1000 Credit', price: 1000, bonus: '+5% bonus',       grad: 'linear-gradient(135deg,#e85d00,#7a2e00)' },
    { sku: 'vch-2000', name: 'Gift Card',        label: '₹2000 Gift Card', price: 2000, bonus: 'Perfect to gift', grad: 'linear-gradient(135deg,#3a1d6e,#ff6a00)' },
    { sku: 'vch-5000', name: 'Gift Card',        label: '₹5000 Gift Card', price: 5000, bonus: '+8% bonus',     grad: 'linear-gradient(135deg,#0a3a5c,#ff6a00)' },
    { sku: 'vch-steam-500',  name: 'Steam Wallet',   label: '₹500 Steam Wallet',   price: 510,  bonus: 'Instant code', grad: 'linear-gradient(135deg,#1b2838,#66c0f4)' },
    { sku: 'vch-gplay-500',  name: 'Google Play',    label: '₹500 Google Play',    price: 505,  bonus: 'Instant code', grad: 'linear-gradient(135deg,#0f9d58,#1a1a1a)' },
  ],
  findVoucher(sku) { return this.vouchers.find(v => v.sku === sku) || null; },
};
