import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   TRADE ACADEMY PRO — 7-Figure Trader Platform
   ═══════════════════════════════════════════════════════ */

// ─── DATA ────────────────────────────────────────────────────────────────────

const STOCKS = [
  { symbol:"AAPL", name:"Apple Inc.",       sector:"Tech",    price:211.45 },
  { symbol:"TSLA", name:"Tesla Inc.",        sector:"Auto",    price:248.90 },
  { symbol:"SPY",  name:"S&P 500 ETF",       sector:"ETF",     price:524.10 },
  { symbol:"NVDA", name:"NVIDIA Corp.",      sector:"Tech",    price:875.20 },
  { symbol:"AMZN", name:"Amazon.com",        sector:"Retail",  price:198.60 },
  { symbol:"META", name:"Meta Platforms",    sector:"Tech",    price:512.30 },
  { symbol:"MSFT", name:"Microsoft",         sector:"Tech",    price:418.75 },
  { symbol:"QQQ",  name:"Nasdaq ETF",        sector:"ETF",     price:446.80 },
  { symbol:"GOOGL",name:"Alphabet Inc.",     sector:"Tech",    price:175.40 },
  { symbol:"AMD",  name:"Advanced Micro",    sector:"Tech",    price:162.55 },
  { symbol:"JPM",  name:"JPMorgan Chase",    sector:"Finance", price:224.30 },
  { symbol:"GLD",  name:"Gold ETF",          sector:"Commodity",price:221.50 },
];

const DICTIONARY = [
  // OPTIONS
  { term:"Ask Price",        cat:"Options",    def:"The price a seller is willing to accept for an option contract. When you buy, you pay the ask." },
  { term:"Assignment",       cat:"Options",    def:"When an option seller is forced to fulfill the contract obligation — buying or selling 100 shares at the strike price." },
  { term:"At The Money (ATM)",cat:"Options",   def:"When the strike price equals (or is very close to) the current stock price. These have the most time value." },
  { term:"Bid Price",        cat:"Options",    def:"The price a buyer is willing to pay. The difference between bid and ask is the 'spread' — the broker's cut." },
  { term:"Bid-Ask Spread",   cat:"Options",    def:"The gap between what buyers will pay and sellers will accept. Tighter spreads = more liquid options = better for traders." },
  { term:"Call Option",      cat:"Options",    def:"A contract giving you the RIGHT (not obligation) to BUY 100 shares at the strike price before expiration. Profits when stock rises." },
  { term:"Contract",         cat:"Options",    def:"One options contract controls 100 shares. If premium is $1.00, the contract costs $100 (1.00 × 100)." },
  { term:"Covered Call",     cat:"Options",    def:"Selling a call option while owning 100 shares of the stock. Generates income but caps your upside." },
  { term:"Delta (Δ)",        cat:"Greeks",     def:"How much the option price moves per $1 move in the stock. 0.50 delta = option moves $0.50 for every $1 the stock moves." },
  { term:"Expiration Date",  cat:"Options",    def:"The date the option contract expires and becomes worthless if out of the money. You must exercise or sell before this date." },
  { term:"Gamma (Γ)",        cat:"Greeks",     def:"The rate of change of delta. High gamma means delta changes rapidly — common in short-dated options near ATM strikes." },
  { term:"Greeks",           cat:"Greeks",     def:"Mathematical measures of option risk: Delta, Gamma, Theta, Vega, and Rho. Essential for understanding how your option will behave." },
  { term:"In The Money (ITM)",cat:"Options",   def:"A call option is ITM when stock price > strike. A put is ITM when stock price < strike. ITM options have intrinsic value." },
  { term:"Intrinsic Value",  cat:"Options",    def:"The real, tangible value of an option right now. For a $200 call when stock is at $215: intrinsic value = $15." },
  { term:"Iron Condor",      cat:"Strategies", def:"A neutral strategy: sell an OTM call AND an OTM put while buying further OTM options as protection. Profits when the stock stays in a range." },
  { term:"LEAPS",            cat:"Options",    def:"Long-Term Equity Anticipation Securities — options with expiration dates 1-3 years out. Less theta decay, used for longer-term directional bets." },
  { term:"Naked Option",     cat:"Options",    def:"Selling an option without owning the underlying stock or having a hedge. Extremely risky — unlimited potential losses on naked calls." },
  { term:"Open Interest",    cat:"Options",    def:"Total number of outstanding option contracts that haven't been settled. High OI = liquid market = better fills." },
  { term:"Out of The Money (OTM)",cat:"Options",def:"A call option where strike > stock price. A put where strike < stock price. OTM options are cheaper but need a bigger move to profit." },
  { term:"Premium",          cat:"Options",    def:"The price you pay to buy an option contract. It's quoted per share, so multiply by 100 for total cost. Premium = intrinsic value + time value." },
  { term:"Put Option",       cat:"Options",    def:"A contract giving you the RIGHT to SELL 100 shares at the strike price before expiration. Profits when the stock falls." },
  { term:"Rho (ρ)",          cat:"Greeks",     def:"Sensitivity of the option price to interest rate changes. Generally less important for short-term traders." },
  { term:"Strike Price",     cat:"Options",    def:"The agreed-upon price at which you can buy (call) or sell (put) the stock. You choose this when buying options." },
  { term:"Theta (Θ)",        cat:"Greeks",     def:"Time decay — the daily dollar amount an option loses in value just by time passing. Enemy of option buyers, friend of option sellers." },
  { term:"Time Value",       cat:"Options",    def:"The portion of an option's premium based on time remaining. More time = more time value. Decays to zero at expiration." },
  { term:"Vega (V)",         cat:"Greeks",     def:"How much the option price changes per 1% change in implied volatility. High vega = big IV swings significantly affect option price." },
  { term:"Vertical Spread",  cat:"Strategies", def:"Buying one option and selling another at a different strike in the same expiration. Reduces cost but caps potential profit." },
  { term:"Volume",           cat:"Options",    def:"Number of option contracts traded today. High volume = active market, easier to enter and exit positions." },
  // STOCKS & MARKET
  { term:"Bear Market",      cat:"Market",     def:"A market decline of 20% or more from recent highs. The overall trend is downward — a 'bear' swipes DOWN with its claws." },
  { term:"Beta",             cat:"Stocks",     def:"How volatile a stock is compared to the market. Beta of 1.5 means the stock moves 50% more than the S&P 500." },
  { term:"Blue Chip Stock",  cat:"Stocks",     def:"Shares of large, well-established, financially sound companies with a long history of reliable performance. Think Apple, Microsoft, Coca-Cola." },
  { term:"Book Value",       cat:"Stocks",     def:"The net value of a company's assets minus liabilities. If a stock trades below book value, it may be undervalued." },
  { term:"Bull Market",      cat:"Market",     def:"A market rise of 20% or more from recent lows. The overall trend is upward — a 'bull' thrusts UP with its horns." },
  { term:"Circuit Breaker",  cat:"Market",     def:"Automatic halt of trading triggered by extreme market drops (7%, 13%, 20% in the S&P). Prevents panic-driven crashes." },
  { term:"Correction",       cat:"Market",     def:"A market decline of 10-20% from a recent high. Less severe than a bear market, considered normal and healthy." },
  { term:"Dividend",         cat:"Stocks",     def:"A portion of company profits paid to shareholders — usually quarterly. Passive income from just owning shares." },
  { term:"Earnings Per Share (EPS)",cat:"Stocks",def:"Company's profit divided by number of shares. Higher EPS = more profitable per share. Key metric for stock valuation." },
  { term:"ETF",              cat:"Stocks",     def:"Exchange-Traded Fund — a basket of stocks you can buy like a single share. SPY tracks 500 companies. Great for diversification." },
  { term:"Float",            cat:"Stocks",     def:"The number of shares available for public trading. Low float + high demand = explosive price moves." },
  { term:"Fundamental Analysis",cat:"Analysis",def:"Evaluating a company based on financial data: revenue, earnings, debt, management. Used by long-term investors like Warren Buffett." },
  { term:"Hedge",            cat:"Strategies", def:"A trade designed to offset potential losses in another trade. Like insurance. Buying puts while holding stock is a classic hedge." },
  { term:"IPO",              cat:"Market",     def:"Initial Public Offering — when a private company sells shares to the public for the first time. Can be volatile and exciting." },
  { term:"Liquidity",        cat:"Market",     def:"How easily you can buy or sell an asset without affecting its price. High liquidity = tight spreads, easy fills. AAPL is very liquid." },
  { term:"Market Cap",       cat:"Stocks",     def:"Total market value of a company's shares. Price × Total Shares. Mega: >$200B, Large: $10-200B, Mid: $2-10B, Small: $300M-2B." },
  { term:"Market Order",     cat:"Trading",    def:"Buy or sell immediately at the best available price. Fast but you don't control the price. Use for liquid stocks only." },
  { term:"P/E Ratio",        cat:"Stocks",     def:"Price-to-Earnings ratio. Stock price divided by EPS. A P/E of 20 means you're paying $20 for every $1 of earnings. Lower can mean better value." },
  { term:"Portfolio",        cat:"Trading",    def:"Your total collection of investments across all assets — stocks, options, ETFs, crypto, real estate, etc." },
  { term:"Short Selling",    cat:"Trading",    def:"Borrowing shares to sell now, hoping to buy back cheaper later and pocket the difference. Profits when stock falls. High risk." },
  { term:"Stock Split",      cat:"Stocks",     def:"When a company divides shares into more shares. 2-for-1 split: you own twice as many shares at half the price. Total value unchanged." },
  { term:"Volatility",       cat:"Analysis",   def:"How wildly a stock price moves. High volatility = big swings up and down. Options on volatile stocks cost more (higher premium)." },
  // TECHNICAL ANALYSIS
  { term:"Bollinger Bands",  cat:"Technical",  def:"Bands plotted 2 standard deviations above and below a 20-day moving average. Stock touching upper band = overbought. Lower band = oversold." },
  { term:"Breakout",         cat:"Technical",  def:"When price moves above a resistance level or below a support level on high volume. Often signals a strong new trend." },
  { term:"Candlestick",      cat:"Technical",  def:"A chart bar showing open, close, high, and low for a time period. Green = price rose. Red = price fell. Body + wicks tell the story." },
  { term:"Death Cross",      cat:"Technical",  def:"When the 50-day moving average crosses BELOW the 200-day MA. Bearish signal — historically precedes further declines." },
  { term:"Doji",             cat:"Technical",  def:"A candlestick where open and close are nearly equal, forming a cross shape. Signals indecision — potential trend reversal coming." },
  { term:"Double Bottom",    cat:"Technical",  def:"A bullish reversal pattern where price hits the same low twice, forming a 'W' shape, then breaks above the middle high." },
  { term:"EMA (Exponential Moving Average)",cat:"Technical",def:"A moving average that weighs recent prices more heavily. Faster to react than simple MA. Day traders use 9 & 21 EMA." },
  { term:"Fibonacci Retracement",cat:"Technical",def:"Key support/resistance levels based on the Fibonacci sequence (23.6%, 38.2%, 50%, 61.8%). Price often bounces at these levels." },
  { term:"Golden Cross",     cat:"Technical",  def:"When the 50-day moving average crosses ABOVE the 200-day MA. Bullish signal — often starts major uptrends." },
  { term:"Head & Shoulders", cat:"Technical",  def:"A bearish reversal pattern with three peaks — left shoulder, head (tallest), right shoulder. Breaking the 'neckline' is a sell signal." },
  { term:"MACD",             cat:"Technical",  def:"Moving Average Convergence Divergence. Shows momentum by comparing two EMAs. When MACD line crosses above signal = bullish." },
  { term:"Moving Average (MA)",cat:"Technical",def:"Average price over a specific period (9, 50, 200 days). Smooths out noise. Price above MA = bullish. Price below MA = bearish." },
  { term:"Relative Strength Index (RSI)",cat:"Technical",def:"Momentum oscillator 0-100. Above 70 = overbought (potential drop). Below 30 = oversold (potential bounce). 50 = neutral." },
  { term:"Resistance",       cat:"Technical",  def:"A price level where selling pressure has historically stopped an upward move. Like a ceiling. Breakouts above resistance are bullish." },
  { term:"Support",          cat:"Technical",  def:"A price level where buying interest has historically stopped a downward move. Like a floor. Bounces off support are bullish." },
  { term:"VWAP",             cat:"Technical",  def:"Volume Weighted Average Price — the average price weighted by volume. Day traders use VWAP as a key intraday support/resistance." },
  // TRADING CONCEPTS
  { term:"Alpha",            cat:"Investing",  def:"Return above the market benchmark. If S&P returns 10% and you return 15%, your alpha is 5%. The goal of active investing." },
  { term:"Arbitrage",        cat:"Trading",    def:"Exploiting price differences of the same asset on different markets to make risk-free profit. Rare but powerful when found." },
  { term:"Day Trading",      cat:"Trading",    def:"Buying and selling the same security within a single trading day. All positions are closed before market close." },
  { term:"Dollar Cost Averaging (DCA)",cat:"Investing",def:"Investing a fixed dollar amount at regular intervals regardless of price. Reduces impact of volatility. Warren Buffett's advice." },
  { term:"Fill",             cat:"Trading",    def:"When your order is executed. A 'good fill' means you got a better price than expected. A 'bad fill' = slippage." },
  { term:"Gap Up / Gap Down",cat:"Technical",  def:"When a stock opens significantly higher (gap up) or lower (gap down) than the prior close. Often due to earnings or news." },
  { term:"Implied Volatility (IV)",cat:"Options",def:"The market's forecast of likely movement in a security's price. High IV = expensive options. Often spikes before earnings." },
  { term:"IV Crush",         cat:"Options",    def:"The sharp drop in implied volatility after a major event (like earnings). Even if the stock moves, option value can collapse." },
  { term:"Leverage",         cat:"Trading",    def:"Using borrowed money or derivatives (like options) to amplify returns. A $100 option controlling $20,000 of stock is massive leverage." },
  { term:"Limit Order",      cat:"Trading",    def:"An order to buy or sell only at a specific price or better. More control than market orders. Use this for options!" },
  { term:"Margin",           cat:"Trading",    def:"Borrowing money from your broker to trade larger positions. Amplifies gains AND losses. Can lose more than you invested." },
  { term:"PDT Rule",         cat:"Trading",    def:"Pattern Day Trader rule. If you make 4+ day trades in 5 business days with under $25,000 account, you get restricted." },
  { term:"Position Sizing",  cat:"Risk",       def:"How much of your account you put into a single trade. Critical to survival. Never risk more than 1-2% of account on one trade." },
  { term:"Pre-Market / After-Hours",cat:"Market",def:"Trading before 9:30 AM and after 4:00 PM EST. Lower volume, wider spreads, more volatile. Options don't trade pre/after hours." },
  { term:"Risk/Reward Ratio",cat:"Risk",       def:"Potential profit divided by potential loss. A 3:1 ratio means risking $100 to potentially make $300. Aim for at least 2:1." },
  { term:"Scalping",         cat:"Trading",    def:"Making many small trades to capture tiny price movements. Very fast — hold times of seconds to minutes. Requires discipline." },
  { term:"Slippage",         cat:"Trading",    def:"The difference between expected price and actual execution price. Common in fast markets or illiquid assets." },
  { term:"Stop Loss",        cat:"Risk",       def:"An automatic sell order triggered when price hits a set level. Limits your loss. NON-NEGOTIABLE for every trade." },
  { term:"Swing Trading",    cat:"Trading",    def:"Holding trades for days to weeks to capture 'swings' in price. Less stressful than day trading. Great for beginners." },
  { term:"Take Profit (TP)", cat:"Risk",       def:"A preset order to automatically close a position when it reaches your profit target. Locks in gains before reversal." },
  { term:"Wash Sale Rule",   cat:"Tax",        def:"IRS rule: if you sell a stock at a loss and re-buy within 30 days, you can't claim the tax loss. Plan year-end trades carefully." },
  // INVESTING
  { term:"Asset Allocation",  cat:"Investing", def:"How you divide your portfolio among different asset classes (stocks, bonds, real estate, cash). Key to managing risk." },
  { term:"Compound Interest", cat:"Investing", def:"Earning interest on your interest. $10,000 at 10% annual return becomes $1.7M in 30 years. Einstein called it the 8th wonder." },
  { term:"Diversification",   cat:"Investing", def:"Spreading investments across different sectors, assets, and geographies to reduce risk. 'Don't put all eggs in one basket.'" },
  { term:"Index Fund",        cat:"Investing", def:"A fund that tracks a market index like the S&P 500. Low fees, automatic diversification. Outperforms most active managers long-term." },
  { term:"Rebalancing",       cat:"Investing", def:"Periodically adjusting your portfolio back to target allocation. If stocks grow to 80% of portfolio, sell some to restore balance." },
  { term:"ROI",               cat:"Investing", def:"Return on Investment. (Profit ÷ Cost) × 100. If you made $500 on a $1,000 investment, ROI = 50%." },
  { term:"Value Investing",   cat:"Investing", def:"Buying stocks trading below their intrinsic value — finding bargains the market has overlooked. Warren Buffett's core strategy." },
];

const STRATEGIES = [
  { name:"Long Call", risk:"Defined", direction:"Bullish", complexity:"Beginner", icon:"📈",
    when:"Stock will move UP significantly", how:"Buy 1 CALL option at strike above current price",
    maxProfit:"Unlimited (stock can go infinitely high)", maxLoss:"Premium paid (100% of investment)",
    example:"AAPL at $200. Buy $210 CALL for $1 ($100 cost). If AAPL hits $225, option worth ~$15 → $1,500. Profit: $1,400 (1,300%!)" },
  { name:"Long Put", risk:"Defined", direction:"Bearish", complexity:"Beginner", icon:"📉",
    when:"Stock will move DOWN significantly", how:"Buy 1 PUT option at strike below current price",
    maxProfit:"Strike price × 100 (stock can only go to zero)", maxLoss:"Premium paid",
    example:"TSLA at $250. Buy $240 PUT for $1 ($100). If TSLA crashes to $200, option worth ~$40 → $4,000. Profit: $3,900!" },
  { name:"Covered Call", risk:"Partial", direction:"Neutral/Slightly Bullish", complexity:"Intermediate", icon:"💰",
    when:"Own 100+ shares, expect flat to slightly up movement", how:"Own 100 shares + Sell 1 CALL above current price",
    maxProfit:"Premium received + stock gains up to strike", maxLoss:"Stock drops (offset by premium)",
    example:"Own 100 AAPL at $200. Sell $210 CALL for $2 ($200 credit). If AAPL stays below $210, keep $200. Repeat monthly for income!" },
  { name:"Cash Secured Put", risk:"Partial", direction:"Neutral/Bullish", complexity:"Intermediate", icon:"🏦",
    when:"Want to buy stock at a discount, or generate income", how:"Sell 1 PUT at strike where you'd be happy owning the stock",
    maxProfit:"Premium received", maxLoss:"Strike × 100 - premium (buying stock at strike)",
    example:"MSFT at $420. Sell $400 PUT for $3 ($300 credit). Either keep $300 if stock stays above $400, or buy 100 MSFT shares for $400 (discounted!)" },
  { name:"Bull Call Spread", risk:"Defined", direction:"Bullish", complexity:"Intermediate", icon:"🐂",
    when:"Moderately bullish — expect stock to rise but not massively", how:"Buy lower strike CALL + Sell higher strike CALL (same expiry)",
    maxProfit:"Difference in strikes - net premium paid", maxLoss:"Net premium paid",
    example:"SPY at $520. Buy $520 CALL for $3, Sell $530 CALL for $1. Net cost: $2 ($200). Max profit: $8 ($800) if SPY hits $530." },
  { name:"Bear Put Spread", risk:"Defined", direction:"Bearish", complexity:"Intermediate", icon:"🐻",
    when:"Moderately bearish — expect stock to fall", how:"Buy higher strike PUT + Sell lower strike PUT (same expiry)",
    maxProfit:"Difference in strikes - net premium paid", maxLoss:"Net premium paid",
    example:"TSLA at $250. Buy $250 PUT for $4, Sell $235 PUT for $1. Net cost: $3 ($300). Max profit: $12 ($1,200) if TSLA drops to $235." },
  { name:"Iron Condor", risk:"Defined", direction:"Neutral", complexity:"Advanced", icon:"🦅",
    when:"Stock will stay in a range (low volatility expected)", how:"Sell OTM call + Sell OTM put + Buy further OTM call + Buy further OTM put",
    maxProfit:"Net premium received", maxLoss:"Width of one spread - premium received",
    example:"SPY at $520. Sell $530 call, Buy $540 call, Sell $510 put, Buy $500 put. Collect $2 ($200). Keep all $200 if SPY stays between $510-$530." },
  { name:"Straddle", risk:"Defined", direction:"Volatile (Either Way)", complexity:"Advanced", icon:"⚡",
    when:"Big move expected but unsure of direction (earnings play!)", how:"Buy 1 ATM CALL + Buy 1 ATM PUT same strike, same expiry",
    maxProfit:"Unlimited (in either direction)", maxLoss:"Total premium paid for both options",
    example:"NVDA earnings tomorrow at $875. Buy $875 CALL for $12 + Buy $875 PUT for $11. Total cost: $23 ($2,300). Profitable if NVDA moves more than $23 either way." },
  { name:"PMCC (Poor Man's Covered Call)", risk:"Defined", direction:"Neutral/Bullish", complexity:"Advanced", icon:"💎",
    when:"Want covered call income without buying 100 shares", how:"Buy deep ITM LEAPS CALL + Sell short-dated OTM CALL",
    maxProfit:"Premium from short calls over time", maxLoss:"Net debit paid",
    example:"AAPL LEAPS $150 CALL (1 yr) for $65 ($6,500). Sell monthly $215 CALL for $1.50 ($150). Collect ~$150/month in premium. Low capital requirement vs owning 100 shares." },
];

const ROADMAP = [
  { phase:"Phase 1", title:"Foundation (Month 1-2)", icon:"🌱", color:"#00cc66",
    goals:["Complete all 8 Academy lessons", "Learn to read candlestick charts", "Understand calls, puts, and the Greeks", "Paper trade for 30 days minimum"],
    metrics:"Goal: 70%+ quiz scores, understand RSI + MA", books:["'Options as a Strategic Investment' - McMillan", "'How to Make Money in Stocks' - William O'Neil"] },
  { phase:"Phase 2", title:"Strategy Mastery (Month 3-4)", icon:"⚔️", color:"#0099ff",
    goals:["Master Bull/Bear spreads", "Learn Iron Condor and Covered Calls", "Build a consistent paper trading record", "Track all trades in your journal"],
    metrics:"Goal: Positive P&L for 3 consecutive weeks on paper", books:["'Trading in the Zone' - Mark Douglas", "'Option Volatility & Pricing' - Sheldon Natenberg"] },
  { phase:"Phase 3", title:"First Real Money (Month 5-6)", icon:"💵", color:"#ffaa00",
    goals:["Open brokerage account (Tastytrade or ToS)", "Start with $1,000-$5,000 RISK capital only", "Use position sizing strictly (1% rule)", "Keep trading journal religiously"],
    metrics:"Goal: Small consistent gains, minimal large losses", books:["'The Psychology of Money' - Morgan Housel", "'Reminiscences of a Stock Operator' - Livermore"] },
  { phase:"Phase 4", title:"Scale Up (Month 7-12)", icon:"📈", color:"#ff6600",
    goals:["Identify your edge — what setups work for YOU", "Scale winning strategies, cut losers", "Learn tax optimization for traders", "Build income strategies (covered calls, CSPs)"],
    metrics:"Goal: 10-20% annual return on capital", books:["'The Options Playbook' - Brian Overby", "'Market Wizards' - Jack Schwager"] },
  { phase:"Phase 5", title:"6-Figure Trader (Year 2-3)", icon:"🏆", color:"#ff3366",
    goals:["Diversify: stocks, options, ETFs, real estate", "Automate screening with scanners", "Mentor others — teaching deepens mastery", "Build passive income streams"],
    metrics:"Goal: $50K-$100K annual trading income", books:["'The Intelligent Investor' - Benjamin Graham", "'One Up on Wall Street' - Peter Lynch"] },
  { phase:"Phase 6", title:"7-Figure Wealth (Year 3+)", icon:"💰", color:"#cc00ff",
    goals:["Multiple income streams from markets", "Real estate + dividend stocks + options income", "Tax-advantaged accounts (IRA, HSA)", "Give back — build generational wealth"],
    metrics:"Goal: $1M+ net worth from markets", books:["'Rich Dad Poor Dad' - Kiyosaki", "'The Millionaire Fastlane' - DeMarco"] },
];

const PATTERNS = [
  { name:"Bull Flag",    type:"Bullish",  icon:"🚩", desc:"Strong upward move (flagpole), then tight consolidation (flag). Breakout above flag = continuation up.", winRate:"68%" },
  { name:"Bear Flag",    type:"Bearish",  icon:"🏴", desc:"Strong downward move, then tight consolidation. Breakdown below flag = continuation down.", winRate:"65%" },
  { name:"Cup & Handle", type:"Bullish",  icon:"☕", desc:"Rounded bottom (cup) followed by small pullback (handle). Breakout above handle resistance = big bullish move.", winRate:"71%" },
  { name:"Double Top",   type:"Bearish",  icon:"🔝", desc:"Two peaks at the same price level. Signals resistance is strong. Break below neckline = bearish reversal.", winRate:"67%" },
  { name:"Double Bottom",type:"Bullish",  icon:"🔂", desc:"Two lows at the same price level. Support is strong. Break above neckline = bullish reversal.", winRate:"69%" },
  { name:"Head & Shoulders",type:"Bearish",icon:"👤",desc:"Three peaks — left shoulder, higher head, right shoulder. Bearish reversal when neckline breaks.", winRate:"72%" },
  { name:"Ascending Triangle",type:"Bullish",icon:"△",desc:"Flat resistance + rising support line. Buyers getting aggressive. Upside breakout likely.", winRate:"70%" },
  { name:"Descending Triangle",type:"Bearish",icon:"▽",desc:"Flat support + declining resistance. Sellers getting aggressive. Downside breakdown likely.", winRate:"68%" },
  { name:"Wedge (Rising)",type:"Bearish", icon:"📐", desc:"Price moves up but in a tightening wedge. Typically breaks DOWN. Counterintuitive but reliable.", winRate:"66%" },
  { name:"Wedge (Falling)",type:"Bullish",icon:"📏", desc:"Price moves down in tightening wedge. Often breaks UP. Great reversal entry for calls.", winRate:"65%" },
  { name:"Engulfing (Bullish)",type:"Bullish",icon:"🕯️",desc:"Large green candle completely engulfs previous red candle. Strong buying pressure signal, especially at support.", winRate:"63%" },
  { name:"Hammer",        type:"Bullish", icon:"🔨", desc:"Small body at top, long lower wick. Stock was rejected from lows — buyers stepped in hard. Look for at support.", winRate:"61%" },
];

const EARNINGS_CAL = [
  { symbol:"AAPL", date:"Jan 30", est_eps:2.35, act_eps:null, est_rev:"124.1B", act_rev:null },
  { symbol:"NVDA", date:"Feb 26", est_eps:0.84, act_eps:null, est_rev:"38.3B", act_rev:null },
  { symbol:"TSLA", date:"Jan 29", est_eps:0.73, act_eps:0.71, est_rev:"27.2B", act_rev:25.7 },
  { symbol:"META", date:"Jan 29", est_eps:6.77, act_eps:8.02, est_rev:"47.1B", act_rev:48.4 },
  { symbol:"MSFT", date:"Jan 29", est_eps:3.11, act_eps:3.23, est_rev:"69.1B", act_rev:69.6 },
  { symbol:"AMZN", date:"Feb 6",  est_eps:1.49, act_eps:1.86, est_rev:"187.8B",act_rev:187.8 },
  { symbol:"GOOGL", date:"Feb 4", est_eps:2.12, act_eps:2.15, est_rev:"96.7B", act_rev:96.5 },
  { symbol:"AMD",   date:"Feb 4", est_eps:1.09, act_eps:1.09, est_rev:"7.5B",  act_rev:7.66 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function genCandles(base, count=80) {
  const out=[]; let p=base;
  for(let i=0;i<count;i++){
    const o=p, d=(Math.random()-.48)*p*.022, c=Math.max(o+d,1);
    const h=Math.max(o,c)+Math.random()*p*.009, l=Math.min(o,c)-Math.random()*p*.009;
    out.push({open:o,close:c,high:h,low:l,bull:c>=o,vol:Math.round(Math.random()*50+10)});
    p=c;
  }
  return out;
}
function rsi(candles){
  if(candles.length<15)return 50;
  const g=[],ls=[];
  for(let i=1;i<candles.length;i++){const d=candles[i].close-candles[i-1].close;g.push(d>0?d:0);ls.push(d<0?-d:0);}
  const avg=(a,n)=>a.slice(-n).reduce((x,y)=>x+y,0)/n;
  return Math.round(100-100/(1+avg(g,14)/(avg(ls,14)||.001)));
}
function ma(candles,n){if(candles.length<n)return null;return candles.slice(-n).reduce((a,c)=>a+c.close,0)/n;}
function fmtUSD(n){return n<0?`-$${Math.abs(n).toFixed(2)}`:`$${n.toFixed(2)}`;}

// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────
function CandleChart({candles,h=220}){
  const W=700, H=h, disp=candles.slice(-50);
  const prices=disp.flatMap(c=>[c.high,c.low]);
  const mn=Math.min(...prices), mx=Math.max(...prices), rng=mx-mn||1;
  const PAD=30, cH=H-PAD, cW=W-10, cw=cW/disp.length;
  const py=v=>cH-((v-mn)/rng)*(cH-10)+5;
  const ma9=disp.map((_,i)=>{const s=disp.slice(Math.max(0,i-8),i+1);return s.reduce((a,c)=>a+c.close,0)/s.length;});
  const ma20=disp.map((_,i)=>{const s=disp.slice(Math.max(0,i-19),i+1);return s.reduce((a,c)=>a+c.close,0)/s.length;});
  const bb_mid=disp.map((_,i)=>{const s=disp.slice(Math.max(0,i-19),i+1);return s.reduce((a,c)=>a+c.close,0)/s.length;});
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:"transparent"}}>
      {[0,.25,.5,.75,1].map(t=>{const v=mn+t*rng,y=py(v);return(
        <g key={t}><line x1={0} x2={W} y1={y} y2={y} stroke="#111c2e" strokeWidth="1"/>
        <text x={W-2} y={y+3} textAnchor="end" fill="#2a4060" fontSize="9">${v.toFixed(0)}</text></g>);})}
      {disp.map((c,i)=>{
        const x=i*cw+cw/2+5, bT=py(Math.max(c.open,c.close)), bB=py(Math.min(c.open,c.close));
        const bH=Math.max(bB-bT,1), col=c.bull?"#00e676":"#ff4444";
        return(<g key={i}><line x1={x} x2={x} y1={py(c.high)} y2={py(c.low)} stroke={col} strokeWidth="1"/>
          <rect x={x-cw*.38} y={bT} width={cw*.76} height={bH} fill={col} rx="1"/></g>);})}
      <polyline fill="none" stroke="#00bfff" strokeWidth="1.5" strokeDasharray="3,2"
        points={ma9.map((v,i)=>`${i*cw+cw/2+5},${py(v)}`).join(" ")}/>
      <polyline fill="none" stroke="#ffaa00" strokeWidth="1.5" strokeDasharray="3,2"
        points={ma20.map((v,i)=>`${i*cw+cw/2+5},${py(v)}`).join(" ")}/>
      <text x="8" y="14" fill="#00bfff" fontSize="8">9 EMA</text>
      <text x="50" y="14" fill="#ffaa00" fontSize="8">20 MA</text>
    </svg>
  );
}

function SparkLine({candles,w=120,h=40,color="#00e676"}){
  const cl=candles.map(c=>c.close), mn=Math.min(...cl), mx=Math.max(...cl), rng=mx-mn||1;
  const pts=cl.map((p,i)=>`${(i/(cl.length-1))*w},${h-((p-mn)/rng)*(h-2)+1}`).join(" ");
  return(
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".3"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polyline fill="url(#sg)" stroke="none" points={`0,${h} ${pts} ${w},${h}`}/>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts}/>
    </svg>
  );
}

// ─── AI COACH ─────────────────────────────────────────────────────────────────
function AICoach({stock, candles, balance, portfolio}){
  const [msgs, setMsgs]=useState([{role:"assistant",content:`🤖 Welcome to your AI Trading Coach! I'm analyzing ${stock?.symbol||"the market"} right now.\n\nAsk me ANYTHING:\n• "Should I buy a call or put on ${stock?.symbol}?"\n• "Explain theta decay to me simply"\n• "Build me a trade plan with $500"\n• "What's the best strategy for earnings?"\n• "Review my portfolio and give feedback"\n\nI'm here to help you become a 7-figure trader! 🚀`}]);
  const [inp,setInp]=useState(""), [loading,setLoading]=useState(false);
  const ref=useRef(null);
  const currPrice=candles.slice(-1)[0]?.close||stock?.price||0;
  const r=rsi(candles), m50=ma(candles,50), m200=ma(candles,200);
  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send=async()=>{
    if(!inp.trim()||loading)return;
    const q=inp.trim(); setInp(""); setLoading(true);
    setMsgs(p=>[...p,{role:"user",content:q}]);
    const sys=`You are an elite options trading coach and wealth-building mentor. You speak clearly, use real numbers, emojis, and concrete examples. You teach like explaining to a motivated 14-year-old who wants to become a 7-figure trader.

LIVE MARKET CONTEXT:
- Stock: ${stock?.symbol} (${stock?.name})
- Price: $${currPrice.toFixed(2)}
- RSI(14): ${r} — ${r>70?"OVERBOUGHT":r<30?"OVERSOLD":"NEUTRAL"}
- 50 MA: $${m50?.toFixed(2)||"N/A"} | Price is ${m50?currPrice>m50?"ABOVE (bullish)":"BELOW (bearish)":"N/A"} it
- 200 MA: $${m200?.toFixed(2)||"N/A"} | Price is ${m200?currPrice>m200?"ABOVE (long-term bullish)":"BELOW (long-term bearish)":"N/A"} it
- Paper Balance: $${balance?.toFixed(2)||"N/A"}
- Open Positions: ${portfolio?.length||0}

YOUR ROLE: Teach options (calls, puts, spreads, greeks, risk management), chart reading, trading psychology, wealth building, and strategy. When asked for trade ideas, give specific entries, strikes, expiry, target, and stop. Always remind about risk management. For portfolio feedback, be constructive and educational. Keep responses under 300 words unless a deep explanation is needed.`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,
          messages:[...msgs.filter((_,i)=>i>0).map(m=>({role:m.role,content:m.content})),{role:"user",content:q}]})});
      const d=await res.json();
      setMsgs(p=>[...p,{role:"assistant",content:d.content?.[0]?.text||"Error processing. Try again!"}]);
    }catch{setMsgs(p=>[...p,{role:"assistant",content:"⚠️ Connection error. Please retry."}]);}
    setLoading(false);
  };

  const QUICK=["Give me a trade setup for today","Explain RSI in simple terms","What's my biggest trading mistake to avoid?","How do I manage risk with $1,000?","What is theta decay?","Best strategy for beginners?"];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#0066ff,#00ccff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:8,flexShrink:0,marginTop:2}}>🤖</div>}
            <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"4px 16px 16px 16px",
              background:m.role==="user"?"linear-gradient(135deg,#004ccc,#0033aa)":"#0c1a2e",
              border:m.role==="assistant"?"1px solid #1a3050":"none",
              color:"#d8eeff",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:4,padding:"10px 14px",background:"#0c1a2e",border:"1px solid #1a3050",borderRadius:"4px 16px 16px 16px",width:70,alignItems:"center"}}>
          {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#0088ff",animation:`bounce 1.2s ${i*.25}s infinite`}}/>)}
        </div>}
        <div ref={ref}/>
      </div>
      <div style={{padding:"8px 12px",borderTop:"1px solid #1a2a40",display:"flex",gap:6,flexWrap:"wrap"}}>
        {QUICK.map(q=><button key={q} onClick={()=>{setInp(q);}}
          style={{fontSize:10,background:"#0c1a2e",border:"1px solid #1e3a5f",borderRadius:20,padding:"4px 10px",color:"#4a90c9",cursor:"pointer"}}>{q}</button>)}
      </div>
      <div style={{padding:"8px 12px",borderTop:"1px solid #1a2a40",display:"flex",gap:8}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask anything about trading, options, strategy..." 
          style={{flex:1,background:"#091525",border:"1px solid #1e3a5f",borderRadius:10,padding:"10px 14px",color:"#d8eeff",fontSize:13,outline:"none"}}/>
        <button onClick={send} disabled={loading}
          style={{background:"linear-gradient(135deg,#0055ee,#003dcc)",border:"none",borderRadius:10,padding:"10px 18px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>
          {loading?"...":"Send ➤"}
        </button>
      </div>
    </div>
  );
}

// ─── P&L CALCULATOR ──────────────────────────────────────────────────────────
function PLCalc(){
  const [form,setForm]=useState({type:"CALL",entry:2,strike:210,target:220,stop:205,qty:1,stockPrice:211});
  const f=v=>parseFloat(v)||0;
  const {type,entry,strike,target,stop,qty,stockPrice}=form;
  const sp=f(stockPrice), st=f(strike), en=f(entry), tgt=f(target), stp=f(stop), q=parseInt(qty)||1;
  const cost=en*100*q;
  const targetPrem=type==="CALL"?Math.max(0,tgt-st):Math.max(0,st-tgt);
  const stopPrem=type==="CALL"?Math.max(0,stp-st):Math.max(0,st-stp);
  const targetPnl=(targetPrem-en)*100*q;
  const stopPnl=(stopPrem-en)*100*q;
  const breakeven=type==="CALL"?st+en:st-en;
  const rr=Math.abs(targetPnl/stopPnl).toFixed(2);
  const targetPct=((targetPnl/cost)*100).toFixed(0);
  const stopPct=((stopPnl/cost)*100).toFixed(0);
  const F=(k,v)=>setForm(p=>({...p,[k]:v}));
  const inp={background:"#091525",border:"1px solid #1e3a5f",borderRadius:8,padding:"8px 10px",color:"#d8eeff",fontSize:13,width:"100%",outline:"none"};
  const sel={...inp};
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div>
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:12,color:"#4a90d9"}}>⚙️ Trade Parameters</h3>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>OPTION TYPE</label>
              <select style={sel} value={type} onChange={e=>F("type",e.target.value)}><option value="CALL">CALL 📈</option><option value="PUT">PUT 📉</option></select></div>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>CONTRACTS</label>
              <input style={inp} type="number" min="1" value={qty} onChange={e=>F("qty",e.target.value)}/></div>
          </div>
          {[["stockPrice","Current Stock Price ($)"],["strike","Strike Price ($)"],["entry","Entry Premium ($)"],["target","Target Stock Price ($)"],["stop","Stop Stock Price ($)"]].map(([k,label])=>(
            <div key={k}><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>{label}</label>
              <input style={inp} type="number" step="0.01" value={form[k]} onChange={e=>F(k,e.target.value)}/></div>
          ))}
        </div>
      </div>
      <div>
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:12,color:"#4a90d9"}}>📊 Trade Analysis</h3>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            ["Total Cost",fmtUSD(cost),"#4a90d9","Your maximum risk"],
            ["Breakeven",fmtUSD(breakeven),"#e0eeff","Stock must be here at expiry to not lose"],
            ["Target P&L",`${fmtUSD(targetPnl)} (${targetPct}%)`,targetPnl>=0?"#00e676":"#ff4444","If stock hits target"],
            ["Stop P&L",`${fmtUSD(stopPnl)} (${stopPct}%)`,stopPnl>=0?"#00e676":"#ff4444","If stock hits stop"],
            ["Risk/Reward",`${rr}:1`,parseFloat(rr)>=2?"#00e676":parseFloat(rr)>=1?"#ffaa00":"#ff4444",parseFloat(rr)>=2?"✅ Great setup!":parseFloat(rr)>=1?"⚠️ Acceptable":"❌ Risk too high"],
          ].map(([label,val,color,note])=>(
            <div key={label} style={{background:"#091525",border:"1px solid #1a2a40",borderRadius:8,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:11,color:"#4a6080"}}>{label}</div><div style={{fontSize:9,color:"#2a4060",marginTop:2}}>{note}</div></div>
              <div style={{fontSize:16,fontWeight:700,color,fontFamily:"'Space Mono',monospace"}}>{val}</div>
            </div>
          ))}
          <div style={{background:parseFloat(rr)>=2?"#001a0a":"#1a0a00",border:`1px solid ${parseFloat(rr)>=2?"#004422":"#440000"}`,borderRadius:8,padding:10,fontSize:11,color:parseFloat(rr)>=2?"#00cc44":"#ff8888",lineHeight:1.6}}>
            {parseFloat(rr)>=2?`✅ This is a solid trade setup! For every $1 you risk, you stand to make $${rr}. This is the kind of risk/reward that builds accounts.`:`⚠️ This setup has unfavorable risk/reward. Consider moving your target higher or stop closer. Elite traders demand 2:1 or better.`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRADE JOURNAL ────────────────────────────────────────────────────────────
function TradeJournal(){
  const [entries,setEntries]=useState([
    {id:1,date:"2026-03-10",symbol:"AAPL",type:"CALL",entry:2.10,exit:4.50,qty:2,result:"WIN",emotion:"Confident",lesson:"Waited for RSI dip below 40, patient entry paid off",tags:["RSI","patience"]},
    {id:2,date:"2026-03-08",symbol:"TSLA",type:"PUT",entry:3.00,exit:1.20,qty:1,result:"LOSS",emotion:"FOMO",lesson:"Chased price after big move already happened. No entry signal.",tags:["FOMO","chasing"]},
  ]);
  const [form,setForm]=useState({date:"",symbol:"",type:"CALL",entry:"",exit:"",qty:1,emotion:"Neutral",lesson:"",tags:""});
  const [show,setShow]=useState(false);
  const F=(k,v)=>setForm(p=>({...p,[k]:v}));
  const add=()=>{
    if(!form.date||!form.symbol||!form.entry||!form.exit)return;
    const pnl=(parseFloat(form.exit)-parseFloat(form.entry))*100*parseInt(form.qty);
    setEntries(p=>[{...form,id:Date.now(),result:pnl>=0?"WIN":"LOSS",pnl,tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean)},...p]);
    setForm({date:"",symbol:"",type:"CALL",entry:"",exit:"",qty:1,emotion:"Neutral",lesson:"",tags:""});
    setShow(false);
  };
  const wins=entries.filter(e=>e.result==="WIN").length;
  const totalPnl=entries.reduce((s,e)=>s+(e.pnl||((parseFloat(e.exit)-parseFloat(e.entry))*100*e.qty)),0);
  const avgWin=entries.filter(e=>e.result==="WIN").reduce((s,e)=>s+(e.pnl||0),0)/(wins||1);
  const avgLoss=Math.abs(entries.filter(e=>e.result==="LOSS").reduce((s,e)=>s+(e.pnl||0),0)/((entries.length-wins)||1));
  const inp={background:"#091525",border:"1px solid #1e3a5f",borderRadius:7,padding:"7px 10px",color:"#d8eeff",fontSize:12,width:"100%",outline:"none"};
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[["Win Rate",`${wins}/${entries.length} (${((wins/entries.length||0)*100).toFixed(0)}%)`,wins/entries.length>=.5?"#00e676":"#ff6644"],
          ["Total P&L",fmtUSD(totalPnl),totalPnl>=0?"#00e676":"#ff4444"],
          ["Avg Win",fmtUSD(avgWin),"#00bfff"],
          ["Avg Loss",`-${fmtUSD(avgLoss)}`,"#ff9900"]].map(([l,v,c])=>(
          <div key={l} style={{background:"#0a1628",border:"1px solid #1e2a3a",borderRadius:10,padding:12}}>
            <div style={{fontSize:10,color:"#4a6080"}}>{l}</div>
            <div style={{fontSize:18,fontWeight:700,color:c,fontFamily:"'Space Mono',monospace",marginTop:4}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h3 style={{fontSize:14,fontWeight:700}}>📝 Trade Journal</h3>
        <button onClick={()=>setShow(!show)} style={{background:"linear-gradient(135deg,#0055ee,#003dcc)",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
          {show?"✕ Cancel":"+ Log Trade"}
        </button>
      </div>
      {show&&(
        <div style={{background:"#0a1628",border:"1px solid #0055ee44",borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>DATE</label><input style={inp} type="date" value={form.date} onChange={e=>F("date",e.target.value)}/></div>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>SYMBOL</label><input style={inp} value={form.symbol} onChange={e=>F("symbol",e.target.value.toUpperCase())} placeholder="AAPL"/></div>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>TYPE</label>
              <select style={inp} value={form.type} onChange={e=>F("type",e.target.value)}><option>CALL</option><option>PUT</option><option>STOCK</option></select></div>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>ENTRY PREMIUM</label><input style={inp} type="number" step=".01" value={form.entry} onChange={e=>F("entry",e.target.value)} placeholder="2.50"/></div>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>EXIT PREMIUM</label><input style={inp} type="number" step=".01" value={form.exit} onChange={e=>F("exit",e.target.value)} placeholder="5.00"/></div>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>CONTRACTS</label><input style={inp} type="number" min="1" value={form.qty} onChange={e=>F("qty",e.target.value)}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>EMOTION DURING TRADE</label>
              <select style={inp} value={form.emotion} onChange={e=>F("emotion",e.target.value)}>
                {["Confident","Anxious","FOMO","Greedy","Disciplined","Scared","Neutral","Excited"].map(e=><option key={e}>{e}</option>)}
              </select></div>
            <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>TAGS (comma separated)</label><input style={inp} value={form.tags} onChange={e=>F("tags",e.target.value)} placeholder="RSI, breakout, earnings"/></div>
          </div>
          <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>LESSON LEARNED</label>
            <textarea style={{...inp,height:60,resize:"vertical"}} value={form.lesson} onChange={e=>F("lesson",e.target.value)} placeholder="What did you learn from this trade? What would you do differently?"/></div>
          <button onClick={add} style={{marginTop:8,background:"linear-gradient(135deg,#00aa44,#007733)",border:"none",borderRadius:8,padding:"8px 20px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>
            Save Trade Entry
          </button>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {entries.map(e=>{
          const pnl=e.pnl||((parseFloat(e.exit)-parseFloat(e.entry))*100*e.qty);
          return(
            <div key={e.id} style={{background:"#0a1628",border:`1px solid ${e.result==="WIN"?"#00441a":"#440010"}`,borderRadius:10,padding:"10px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontWeight:800,fontSize:14}}>{e.symbol}</span>
                  <span style={{background:e.type==="CALL"?"#0044cc22":"#cc220022",color:e.type==="CALL"?"#4499ff":"#ff7766",border:`1px solid ${e.type==="CALL"?"#0044cc44":"#cc220044"}`,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:700}}>{e.type}</span>
                  <span style={{fontSize:11,color:"#4a6080"}}>{e.date}</span>
                  <span style={{fontSize:10,background:"#1a1a2e",borderRadius:5,padding:"1px 7px",color:"#8888aa"}}>😐 {e.emotion}</span>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:pnl>=0?"#00e676":"#ff4444",fontFamily:"'Space Mono',monospace"}}>{pnl>=0?"+":" "}{fmtUSD(pnl)}</div>
                  <div style={{fontSize:10,color:e.result==="WIN"?"#00e676":"#ff4444"}}>{e.result==="WIN"?"✅ WIN":"❌ LOSS"}</div>
                </div>
              </div>
              {e.lesson&&<div style={{fontSize:11,color:"#8899aa",background:"#091525",borderRadius:6,padding:"6px 10px",marginBottom:4}}>💡 {e.lesson}</div>}
              {e.tags?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {e.tags.map(t=><span key={t} style={{fontSize:9,background:"#1e2a3a",color:"#4a7090",borderRadius:4,padding:"2px 6px"}}>{t}</span>)}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function TradeAcademyPro(){
  const TABS=[
    ["learn","📚","Learn"],["chart","📈","Charts"],["trade","💰","Simulator"],
    ["calc","🧮","Calculator"],["strategies","⚔️","Strategies"],["patterns","🎯","Patterns"],
    ["dict","📖","Dictionary"],["journal","📝","Journal"],["roadmap","🗺️","Roadmap"],["ai","🤖","AI Coach"],
  ];

  const [tab,setTab]=useState("learn");
  const [selStock,setSelStock]=useState(STOCKS[0]);
  const [stockData,setStockData]=useState({});
  const [balance,setBalance]=useState(10000);
  const [portfolio,setPortfolio]=useState([]);
  const [tradeLog,setTradeLog]=useState([]);
  const [tradeMsg,setTradeMsg]=useState("");
  const [tradeForm,setTradeForm]=useState({symbol:"AAPL",type:"CALL",strike:"",expiry:"weekly",qty:1});
  const [dictSearch,setDictSearch]=useState(""), [dictCat,setDictCat]=useState("All");
  const [lesson,setLesson]=useState(null), [quizAns,setQuizAns]=useState(null), [completed,setCompleted]=useState([]);

  useEffect(()=>{
    const d={};
    STOCKS.forEach(s=>{d[s.symbol]=genCandles(s.price,80);});
    setStockData(d);
  },[]);

  useEffect(()=>{
    const iv=setInterval(()=>{
      setStockData(prev=>{
        const n={...prev};
        STOCKS.forEach(s=>{
          if(!n[s.symbol])return;
          const arr=[...n[s.symbol]], last=arr[arr.length-1];
          const d=(Math.random()-.49)*last.close*.004;
          const c=Math.max(last.close+d,1);
          arr[arr.length-1]={...last,close:c,high:Math.max(last.high,c),low:Math.min(last.low,c),bull:c>=last.open};
          n[s.symbol]=arr;
        });
        return n;
      });
    },1800);
    return()=>clearInterval(iv);
  },[]);

  const candles=stockData[selStock.symbol]||[];
  const currPrice=candles.slice(-1)[0]?.close||selStock.price;
  const r=rsi(candles), m50=ma(candles,50), m200=ma(candles,200);
  const signal=(()=>{
    if(!m50)return{text:"Loading...",color:"#888",dir:"NEUTRAL"};
    if(r>70&&currPrice>m50)return{text:"⚠️ OVERBOUGHT — Consider PUT",color:"#ff6644",dir:"BEARISH"};
    if(r<30&&currPrice<m50)return{text:"🟢 OVERSOLD — Consider CALL",color:"#00e676",dir:"BULLISH"};
    if(currPrice>m50&&r<60)return{text:"📈 BULLISH — CALL opportunity",color:"#00bfff",dir:"BULLISH"};
    if(currPrice<m50&&r>40)return{text:"📉 BEARISH — PUT opportunity",color:"#ff9900",dir:"BEARISH"};
    return{text:"➡️ NEUTRAL — Wait for signal",color:"#aaa",dir:"NEUTRAL"};
  })();

  const totalPnL=portfolio.reduce((s,p)=>{
    const c=stockData[p.symbol]?.slice(-1)[0]?.close||0;
    const curr=p.type==="CALL"?Math.max(0,c-p.strike):Math.max(0,p.strike-c);
    return s+(curr-p.premium)*100*p.qty;
  },0);

  const executeTrade=()=>{
    const{symbol,type,strike,expiry,qty}=tradeForm;
    if(!strike){setTradeMsg("❌ Enter a strike price!");return;}
    const st=parseFloat(strike);
    const cP=stockData[symbol]?.slice(-1)[0]?.close||STOCKS.find(s=>s.symbol===symbol)?.price||100;
    const prem=+(Math.abs(cP-st)<cP*.05?2.5:1.0+(Math.random()*.8)).toFixed(2);
    const cost=prem*100*parseInt(qty);
    if(cost>balance){setTradeMsg("❌ Not enough balance!");return;}
    setBalance(b=>+(b-cost).toFixed(2));
    const pos={id:Date.now(),symbol,type,strike:st,expiry,qty:parseInt(qty),premium:prem,entryPrice:cP,status:"OPEN"};
    setPortfolio(p=>[...p,pos]);
    setTradeLog(l=>[{...pos,action:"BOUGHT",cost,time:new Date().toLocaleTimeString()},...l]);
    setTradeMsg(`✅ Bought ${qty}x ${symbol} $${st} ${type} @ $${prem} | Cost: $${cost.toFixed(2)}`);
  };

  const closePos=(pos)=>{
    const cP=stockData[pos.symbol]?.slice(-1)[0]?.close||STOCKS.find(s=>s.symbol===pos.symbol)?.price||100;
    const curr=pos.type==="CALL"?Math.max(0,cP-pos.strike):Math.max(0,pos.strike-cP);
    const exitPrem=+(curr+Math.random()*.3).toFixed(2);
    const proceeds=exitPrem*100*pos.qty;
    const pnl=+(proceeds-pos.premium*100*pos.qty).toFixed(2);
    setBalance(b=>+(b+proceeds).toFixed(2));
    setPortfolio(p=>p.filter(x=>x.id!==pos.id));
    setTradeLog(l=>[{...pos,action:"SOLD",proceeds,pnl,exitPrem,time:new Date().toLocaleTimeString()},...l]);
    setTradeMsg(`${pnl>=0?"🎉":"📉"} Closed ${pos.symbol} ${pos.type} | P&L: ${pnl>=0?"+":""}$${pnl}`);
  };

  const filteredDict=DICTIONARY.filter(d=>{
    const matchSearch=!dictSearch||d.term.toLowerCase().includes(dictSearch.toLowerCase())||d.def.toLowerCase().includes(dictSearch.toLowerCase());
    const matchCat=dictCat==="All"||d.cat===dictCat;
    return matchSearch&&matchCat;
  });
  const dictCats=["All",...[...new Set(DICTIONARY.map(d=>d.cat))]];

  const S={
    app:{minHeight:"100vh",background:"#04080f",color:"#d8eeff",fontFamily:"'DM Sans', 'Segoe UI', sans-serif",overflow:"hidden"},
    hdr:{background:"#060d1a",borderBottom:"1px solid #0f1e30",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:100},
    card:(accent="#1a2a40")=>({background:"#080f1c",border:`1px solid ${accent}`,borderRadius:12,padding:14}),
    btn:(c="linear-gradient(135deg,#0055ee,#0033bb)")=>({background:c,border:"none",borderRadius:8,padding:"9px 18px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}),
    inp:{background:"#091525",border:"1px solid #1e3a5f",borderRadius:8,padding:"8px 12px",color:"#d8eeff",fontSize:13,width:"100%",outline:"none"},
    badge:(c)=>({background:c+"18",color:c,border:`1px solid ${c}33`,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}),
  };

  const LESSONS=[
    {id:1,icon:"📊",title:"What is a Stock?",content:`A stock is a tiny ownership slice of a company. When Apple is worth $3 trillion and has ~15 billion shares outstanding, each share = ~$200.\n\n🍕 PIZZA ANALOGY: A company is a pizza cut into millions of slices. Each slice = 1 share. When the company makes more money, the pizza gets bigger — your slice is worth more!\n\n💰 HOW YOU MAKE MONEY:\n• Price Appreciation: Buy at $100, sell at $150 → $50 profit per share\n• Dividends: Company pays you a portion of profits quarterly (passive income!)\n\n📊 STOCK EXCHANGES:\n• NYSE (New York Stock Exchange) — older, more traditional\n• NASDAQ — tech-heavy (Apple, Microsoft, Amazon are here)\n• Trading hours: 9:30 AM – 4:00 PM Eastern Time\n\n🔑 KEY INSIGHT: You don't need to buy expensive stocks. Fractional shares let you buy $5 of Amazon even if the full share costs $180.`,
      quiz:{q:"If Apple has 1 billion shares and is worth $200 billion, what is each share worth?",a:"$200",choices:["$20","$200","$2,000","$20,000"]}},
    {id:2,icon:"📞",title:"Call Options — Bet It Goes UP",content:`A CALL option is a contract giving you the RIGHT to BUY 100 shares at a fixed price before a set date.\n\n🎯 REAL MONEY EXAMPLE:\n• Apple stock = $200 today\n• You buy 1 CALL with $210 strike for $1 premium\n• Total cost = $1 × 100 = $100\n\nSCENARIO A — Apple rockets to $240:\n• Your $210 call is worth at least $30 per share\n• 1 contract = $3,000 value\n• You invested $100... now worth $3,000 = 2,900% gain! 🚀\n\nSCENARIO B — Apple drops to $190:\n• Your call expires worthless\n• You lose $100 (your entire investment)\n\n🔑 BUY CALLS WHEN:\n✅ You believe stock will rise significantly\n✅ Earnings report coming that could beat expectations\n✅ RSI is low (oversold) and bouncing\n✅ Price breaks above key resistance\n\n⚠️ TIME IS YOUR ENEMY: Options lose value every day (theta decay)!`,
      quiz:{q:"When should you BUY a CALL option?",a:"When you think the stock will go UP",choices:["When the stock goes DOWN","When you think the stock will go UP","When stock stays flat","When market is closed"]}},
    {id:3,icon:"📉",title:"Put Options — Bet It Goes DOWN",content:`A PUT option gives you the RIGHT to SELL 100 shares at a fixed price before expiration. Puts PROFIT when stocks FALL.\n\n🎯 REAL MONEY EXAMPLE:\n• Tesla = $250 today\n• You buy 1 PUT with $240 strike for $1 ($100 cost)\n\nSCENARIO A — Tesla crashes to $200:\n• Your $240 put is worth $40 per share\n• 1 contract = $4,000 value\n• $100 invested → $4,000 = 3,900% gain! 💥\n\nSCENARIO B — Tesla climbs to $280:\n• Your put expires worthless\n• You lose your $100 premium\n\n🛡️ PUTS AS INSURANCE:\nPro investors buy puts on stocks they own as protection. If the market crashes, their puts explode in value and offset losses on their stock positions.\n\n🔑 BUY PUTS WHEN:\n✅ You believe stock will drop\n✅ RSI is very high (overbought, above 70)\n✅ Stock hits major resistance\n✅ Bad earnings expected\n✅ Protecting a long stock position`,
      quiz:{q:"A PUT option makes you money when the stock price...?",a:"Goes DOWN",choices:["Goes UP","Goes DOWN","Stays the same","Doubles"]}},
    {id:4,icon:"💵",title:"The $1 Contract — Real Costs",content:`Options are priced per share, but each contract covers 100 shares.\n\n💰 TRUE COST FORMULA:\nContract Cost = Premium × 100\n\n• $0.50 premium = $50 per contract\n• $1.00 premium = $100 per contract  ← "the $1 contract"\n• $5.00 premium = $500 per contract\n• $15.00 premium = $1,500 per contract\n\n📊 WHAT MAKES OPTIONS EXPENSIVE OR CHEAP?\n\n1️⃣ INTRINSIC VALUE\n• How far "in the money" is it?\n• $200 call when stock is at $215 = $15 intrinsic value\n\n2️⃣ TIME VALUE\n• More time until expiry = more expensive\n• 90-day options cost more than 7-day options\n\n3️⃣ IMPLIED VOLATILITY (IV)\n• How wildly does the stock move?\n• TSLA options cost more than Apple options (TSLA is more volatile)\n• IV spikes before earnings — options get expensive!\n\n🗓️ EXPIRATION TIERS:\n• 0DTE = expires TODAY (cheapest, riskiest)\n• Weekly = 5-7 days (popular for day traders)\n• Monthly = 30 days (most liquid)\n• LEAPS = 1-2 years (most expensive, most time)`,
      quiz:{q:"If an option premium is $3.50, what does 1 contract cost you?",a:"$350",choices:["$3.50","$35","$350","$3,500"]}},
    {id:5,icon:"🔢",title:"The Greeks — Your Risk Dashboard",content:`The Greeks are mathematical measures that tell you HOW your option will behave. Every trader MUST know these.\n\n🔵 DELTA (Δ) — Price Sensitivity\n• How much the option moves per $1 stock move\n• 0.50 delta = moves $0.50 for every $1 the stock moves\n• Deep ITM call = delta near 1.0 (moves like stock)\n• Far OTM call = delta near 0.05 (barely moves)\n• Put deltas are NEGATIVE (they move opposite to stock)\n\n🟡 THETA (Θ) — Time Decay (YOUR ENEMY as a buyer!)\n• Amount option loses per day just from time passing\n• $0.05 theta = option loses $5 per day per contract\n• Accelerates in final 30 days before expiry\n• Reason: Never hold options too long!\n\n🟢 GAMMA (Γ) — Delta Acceleration\n• Rate of change of delta. High near ATM options.\n• High gamma = delta changes rapidly = high risk/reward\n\n🔴 VEGA (V) — Volatility Sensitivity\n• How much the option changes per 1% change in IV\n• High vega options profit from IV spikes\n• Buy before earnings for high vega; sell after (IV crush!)\n\n💡 BEGINNER FOCUS: Delta first. Target 0.30–0.50 delta for balanced options.`,
      quiz:{q:"Your call option has 0.40 delta. Stock moves up $5. How much does your option gain?",a:"$2.00",choices:["$0.40","$0.80","$2.00","$5.00"]}},
    {id:6,icon:"📊",title:"Technical Analysis — Read the Chart",content:`Charts are the scoreboard of the market. They show you where buyers and sellers are winning.\n\n🕯️ CANDLESTICK ANATOMY:\n• Green candle: Close > Open (buyers won)\n• Red candle: Close < Open (sellers won)\n• Body = open to close range\n• Wick/Shadow = high and low reached during period\n\n📏 THE KEY LEVELS:\n\nSUPPORT — Price floor where buyers reliably step in\n• Stock bounces UP from support\n• Buy calls when price bounces off support!\n\nRESISTANCE — Price ceiling where sellers take over\n• Stock falls FROM resistance\n• Buy puts when price hits resistance!\n\n📈 MOVING AVERAGES:\n• 9 EMA — fast, for intraday momentum\n• 20/50 MA — medium-term trend\n• 200 MA — THE long-term trend line. Market respects this!\n\n💡 GOLDEN RULE:\n• Price ABOVE 200 MA = market is healthy, lean bullish\n• Price BELOW 200 MA = market is sick, lean bearish\n\n📉 RSI (Relative Strength Index):\n• 0-100 scale\n• Above 70 = overbought (consider puts)\n• Below 30 = oversold (consider calls)\n• Best used at support/resistance levels`,
      quiz:{q:"When RSI is below 30, the stock is...?",a:"Oversold — may bounce up soon",choices:["Overbought — sell now","Oversold — may bounce up soon","Perfectly valued","About to crash"]}},
    {id:7,icon:"🧠",title:"Trading Psychology — The Inner Game",content:`90% of trading success is psychological. Most traders blow up not from lack of knowledge, but from emotional decisions.\n\n😱 THE 7 DEADLY TRADING SINS:\n\n1. FOMO (Fear of Missing Out) — Chasing a stock after it's already moved 20%. You buy the top.\n\n2. REVENGE TRADING — Losing $200, then betting $500 to "make it back fast." Classic account destroyer.\n\n3. MOVING YOUR STOP — "I'll just give it a little more room..." → Stock keeps falling → Huge loss.\n\n4. OVERTRADING — Taking 10+ trades a day because you're bored. Fees + bad entries = account decay.\n\n5. HOLDING LOSERS TOO LONG — "It'll come back." Sometimes it doesn't. Cut losses fast!\n\n6. CUTTING WINNERS SHORT — Selling when up 20% because you're scared, missing a 200% move.\n\n7. POSITION TOO LARGE — Betting 50% of your account on one trade. One loss = catastrophe.\n\n🏆 ELITE TRADER MINDSET:\n✅ Think in probabilities, not certainties\n✅ A loss is just the cost of doing business\n✅ Your job is to execute your process — results follow\n✅ Journal every trade — self-awareness = growth\n✅ "Be greedy when others are fearful, fearful when others are greedy" — Warren Buffett`,
      quiz:{q:"What is 'Revenge Trading'?",a:"Making reckless trades to recover losses quickly",choices:["Trading after 4 PM","Making reckless trades to recover losses quickly","Shorting a company you hate","Day trading on your phone"]}},
    {id:8,icon:"🛡️",title:"Risk Management — How to Never Go Broke",content:`Risk management is the #1 skill separating 7-figure traders from broke traders.\n\n📏 THE NON-NEGOTIABLE RULES:\n\n🔴 THE 1% RULE:\nNever risk more than 1% of your account on any single trade.\n• $1,000 account → max risk = $10 per trade\n• $5,000 account → max risk = $50 per trade\n• $25,000 account → max risk = $250 per trade\n\nWith options, you often risk 100% of what you pay. So if you follow the 1% rule with a $5,000 account, buy options costing max $50 (one $0.50 contract).\n\n🛑 STOP LOSSES:\n• Set your stop BEFORE entering the trade\n• For options: exit if premium drops 40-50%\n• For stocks: set stop 1-2 ATRs below entry\n\n🎯 TAKE PROFITS:\n• Scale out: Take 50% profit at 100% gain\n• Let rest run with house money\n\n📊 POSITION SIZING FORMULA:\nMax $ Risk ÷ Stop Distance = Position Size\n\n🏆 THE GOLDEN RATIO:\nAim for 2:1 or 3:1 Risk/Reward minimum\nRisk $50 to potentially make $100-$150\n\n📅 DAILY LOSS LIMIT:\nIf you lose 3% of your account in one day → STOP TRADING. Live to fight tomorrow.`,
      quiz:{q:"With a $10,000 account using the 1% rule, what is your maximum risk per trade?",a:"$100",choices:["$10","$100","$1,000","$500"]}},
  ];

  return(
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#04080f;}
        ::-webkit-scrollbar-thumb{background:#1a2a40;border-radius:2px;}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes slide-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .card-hover:hover{border-color:#004499 !important;transition:border-color .2s;}
        .tab-btn:hover{color:#d8eeff !important;background:#0c1824 !important;}
        select option{background:#091525;color:#d8eeff;}
      `}</style>

      {/* HEADER */}
      <div style={S.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#0055ee,#00aaff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📊</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,letterSpacing:.5,background:"linear-gradient(90deg,#4499ff,#00ddff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>TRADE ACADEMY PRO</div>
            <div style={{fontSize:9,color:"#2a4060",letterSpacing:3}}>7-FIGURE TRADER PLATFORM</div>
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:2,overflowX:"auto"}}>
          {TABS.map(([id,ico,label])=>(
            <button key={id} className="tab-btn" onClick={()=>setTab(id)}
              style={{background:tab===id?"#0c1824":"transparent",border:"none",borderBottom:tab===id?"2px solid #0055ee":"2px solid transparent",
                borderRadius:"6px 6px 0 0",padding:"8px 10px",color:tab===id?"#4499ff":"#2a4060",cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap",transition:"all .2s"}}>
              {ico} {label}
            </button>
          ))}
        </div>

        <div style={{textAlign:"right",minWidth:120}}>
          <div style={{fontSize:9,color:"#2a4060",letterSpacing:2}}>PAPER BALANCE</div>
          <div style={{fontSize:16,fontWeight:700,fontFamily:"'Space Mono',monospace",color:balance>=10000?"#00e676":"#ff4444"}}>${balance.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
          <div style={{fontSize:10,color:totalPnL>=0?"#00cc44":"#ff4444"}}>{totalPnL>=0?"▲":"▼"} Open P&L: {totalPnL>=0?"+":""}${totalPnL.toFixed(2)}</div>
        </div>
      </div>

      {/* TICKER */}
      <div style={{background:"#060d1a",borderBottom:"1px solid #0f1e30",padding:"5px 20px",display:"flex",gap:20,overflowX:"auto",flexShrink:0}}>
        {STOCKS.map(s=>{
          const c=stockData[s.symbol]?.slice(-1)[0]?.close||s.price;
          const chg=((c-s.price)/s.price*100);
          return(
            <div key={s.symbol} onClick={()=>{setSelStock(s);setTab("chart");}}
              style={{display:"flex",gap:7,alignItems:"center",cursor:"pointer",flexShrink:0,padding:"2px 8px",borderRadius:5,background:selStock.symbol===s.symbol?"#0c1824":"transparent",transition:"background .2s"}}>
              <span style={{fontWeight:700,fontSize:11,color:"#d8eeff"}}>{s.symbol}</span>
              <span style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:chg>=0?"#00e676":"#ff4444"}}>${c.toFixed(2)}</span>
              <span style={{fontSize:9,color:chg>=0?"#00e676":"#ff4444"}}>{chg>=0?"▲":"▼"}{Math.abs(chg).toFixed(2)}%</span>
            </div>
          );
        })}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#00e676",animation:"pulse 2s infinite",display:"inline-block"}}/>
          <span style={{fontSize:9,color:"#2a5060",letterSpacing:2}}>LIVE SIM</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{height:"calc(100vh - 115px)",overflowY:"auto",padding:16}}>

        {/* ── LEARN ── */}
        {tab==="learn"&&(
          <div style={{animation:"slide-in .3s ease"}}>
            {!lesson?(
              <div>
                <div style={{marginBottom:16}}>
                  <h2 style={{fontSize:22,fontWeight:800}}>📚 Options Trading Masterclass</h2>
                  <p style={{color:"#4a7090",marginTop:4,fontSize:13}}>8 essential lessons to build your foundation. Complete each lesson + quiz to unlock the next level.</p>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
                    <div style={{background:"#091525",borderRadius:6,padding:"4px 12px",fontSize:11,color:"#00cc66",border:"1px solid #00441a"}}>{completed.length}/{LESSONS.length} Complete</div>
                    <div style={{flex:1,background:"#0d1929",borderRadius:4,height:4,overflow:"hidden"}}>
                      <div style={{width:`${(completed.length/LESSONS.length)*100}%`,height:"100%",background:"linear-gradient(90deg,#0055ee,#00aaff)",transition:"width .4s"}}/>
                    </div>
                    <div style={{fontSize:11,color:"#4a6080"}}>{Math.round((completed.length/LESSONS.length)*100)}%</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
                  {LESSONS.map((l,i)=>{
                    const done=completed.includes(l.id), locked=i>0&&!completed.includes(LESSONS[i-1].id)&&!done;
                    return(
                      <div key={l.id} className={!locked?"card-hover":""} onClick={()=>!locked&&(setLesson(l),setQuizAns(null))}
                        style={{...S.card(done?"#004422":locked?"#0f1e30":"#1a2a40"),cursor:locked?"not-allowed":"pointer",opacity:locked?.6:1,transition:"all .2s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <span style={{fontSize:28}}>{locked?"🔒":l.icon}</span>
                          {done&&<span style={{...S.badge("#00e676")}}>✓ DONE</span>}
                          {locked&&<span style={{...S.badge("#666")}}>LOCKED</span>}
                        </div>
                        <div style={{marginTop:10,fontWeight:700,fontSize:14}}>{l.title}</div>
                        <div style={{fontSize:11,color:"#4a6080",marginTop:4}}>Lesson {l.id} of {LESSONS.length} · Has quiz</div>
                        {!locked&&!done&&<div style={{marginTop:8,fontSize:11,color:"#0066cc"}}>→ Click to start</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ):(
              <div style={{maxWidth:680,margin:"0 auto",animation:"slide-in .3s ease"}}>
                <button onClick={()=>setLesson(null)} style={{...S.btn("linear-gradient(135deg,#1a2a40,#0f1e30)"),marginBottom:14,fontSize:12}}>← All Lessons</button>
                <div style={{...S.card(),marginBottom:14}}>
                  <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:16,paddingBottom:14,borderBottom:"1px solid #1a2a40"}}>
                    <span style={{fontSize:36}}>{lesson.icon}</span>
                    <div>
                      <div style={{fontSize:10,color:"#4a6080",letterSpacing:2}}>LESSON {lesson.id} OF {LESSONS.length}</div>
                      <h2 style={{fontSize:20,fontWeight:800,marginTop:2}}>{lesson.title}</h2>
                    </div>
                  </div>
                  <div style={{whiteSpace:"pre-wrap",lineHeight:1.85,color:"#c0d8f0",fontSize:13.5}}>{lesson.content}</div>
                </div>
                <div style={{...S.card("#0044cc33"),border:"1px solid #0044cc33"}}>
                  <div style={{fontSize:11,color:"#4488cc",marginBottom:10,fontWeight:700,letterSpacing:1}}>🎯 KNOWLEDGE CHECK</div>
                  <div style={{fontWeight:700,marginBottom:14,fontSize:14}}>{lesson.quiz.q}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {lesson.quiz.choices.map(c=>{
                      const correct=c===lesson.quiz.a, selected=quizAns===c;
                      let bg="#091525",border="#1e3a5f",color="#d8eeff";
                      if(quizAns){if(correct){bg="#001a08";border="#00442244";color="#00e676";}else if(selected){bg="#1a0008";border="#44000044";color="#ff6666";}}
                      return(<button key={c} onClick={()=>{if(!quizAns){setQuizAns(c);if(correct&&!completed.includes(lesson.id))setCompleted(p=>[...p,lesson.id]);}}}
                        style={{background:bg,border:`1px solid ${border}`,borderRadius:9,padding:"10px 14px",color,cursor:"pointer",fontSize:12,textAlign:"left",transition:"all .2s"}}>
                        {quizAns&&correct?"✅ ":quizAns&&selected?"❌ ":""}{c}
                      </button>);
                    })}
                  </div>
                  {quizAns&&<div style={{marginTop:12,padding:10,borderRadius:8,background:quizAns===lesson.quiz.a?"#001a08":"#1a0008",border:`1px solid ${quizAns===lesson.quiz.a?"#00442244":"#44000044"}`,fontSize:12,color:quizAns===lesson.quiz.a?"#00e676":"#ff8888"}}>
                    {quizAns===lesson.quiz.a?"🎉 Correct! Lesson marked complete. Move to the next one!":"Not quite — correct answer: "+lesson.quiz.a}
                  </div>}
                  {quizAns&&lesson.id<LESSONS.length&&<button onClick={()=>{setLesson(LESSONS[lesson.id]);setQuizAns(null);}} style={{...S.btn(),marginTop:10,fontSize:12}}>Next Lesson →</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CHART ── */}
        {tab==="chart"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,animation:"slide-in .3s ease"}}>
            <div>
              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                {STOCKS.map(s=>(
                  <button key={s.symbol} onClick={()=>setSelStock(s)}
                    style={{background:selStock.symbol===s.symbol?"#0c1824":"transparent",border:`1px solid ${selStock.symbol===s.symbol?"#0055ee":"#1a2a40"}`,
                      borderRadius:8,padding:"5px 12px",color:selStock.symbol===s.symbol?"#4499ff":"#4a6080",cursor:"pointer",fontSize:11,fontWeight:600}}>
                    {s.symbol}
                  </button>
                ))}
              </div>
              <div style={S.card()}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:10,color:"#4a6080"}}>{selStock.name} · {selStock.sector}</div>
                    <div style={{fontSize:30,fontWeight:800,fontFamily:"'Space Mono',monospace",marginTop:2}}>${currPrice.toFixed(2)}</div>
                    <div style={{fontSize:12,color:currPrice>=selStock.price?"#00e676":"#ff4444",marginTop:2}}>
                      {currPrice>=selStock.price?"▲":"▼"} ${Math.abs(currPrice-selStock.price).toFixed(2)} ({((currPrice-selStock.price)/selStock.price*100).toFixed(2)}%)
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{...S.badge(signal.color),fontSize:12,padding:"6px 12px"}}>{signal.text}</div>
                    <div style={{fontSize:10,color:"#2a4060",marginTop:6}}>Sector: {selStock.sector}</div>
                  </div>
                </div>
                <CandleChart candles={candles} h={220}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
                  {[["RSI (14)",r,r>70?"#ff4444":r<30?"#00e676":"#00bfff",r>70?"Overbought":r<30?"Oversold":"Neutral"],
                    ["50 MA",m50?"$"+m50.toFixed(2):"—",currPrice>(m50||0)?"#00e676":"#ff9900","Trend"],
                    ["200 MA",m200?"$"+m200.toFixed(2):"—",currPrice>(m200||0)?"#00e676":"#ff4444","Long-Term"],
                    ["Vol",Math.round(Math.random()*60+20)+"M","#4a90d9","Today"]].map(([l,v,c,s])=>(
                    <div key={l} style={{background:"#060d1a",borderRadius:8,padding:10,border:"1px solid #0f1e30"}}>
                      <div style={{fontSize:9,color:"#4a6080"}}>{l}</div>
                      <div style={{fontSize:15,fontWeight:700,color:c,fontFamily:"'Space Mono',monospace",marginTop:3}}>{v}</div>
                      <div style={{fontSize:9,color:"#2a3a50",marginTop:2}}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={S.card()}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:10,color:"#4488cc"}}>📊 RSI Gauge</div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:34,fontWeight:700,color:r>70?"#ff4444":r<30?"#00e676":"#00bfff",fontFamily:"'Space Mono',monospace"}}>{r}</div>
                  <div style={{fontSize:10,letterSpacing:2,color:r>70?"#ff4444":r<30?"#00e676":"#00bfff"}}>{r>70?"OVERBOUGHT":r<30?"OVERSOLD":"NEUTRAL"}</div>
                  <div style={{background:"#060d1a",borderRadius:4,height:6,margin:"8px 0",overflow:"hidden"}}>
                    <div style={{width:`${r}%`,height:"100%",background:`linear-gradient(90deg,#00e676,${r>70?"#ff4444":"#00bfff"})`,transition:"width .5s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#2a4060"}}><span>0</span><span>30</span><span>70</span><span>100</span></div>
                </div>
              </div>
              <div style={S.card()}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:10,color:"#4488cc"}}>📋 Watchlist</div>
                {STOCKS.map(s=>{
                  const c=stockData[s.symbol]?.slice(-1)[0]?.close||s.price;
                  const chg=((c-s.price)/s.price*100);
                  return(
                    <div key={s.symbol} onClick={()=>setSelStock(s)} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #0f1e30",cursor:"pointer",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700}}>{s.symbol}</div>
                        <SparkLine candles={stockData[s.symbol]?.slice(-20)||[]} w={60} h={24} color={chg>=0?"#00e676":"#ff4444"}/>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,fontFamily:"'Space Mono',monospace"}}>${c.toFixed(2)}</div>
                        <div style={{fontSize:10,color:chg>=0?"#00e676":"#ff4444"}}>{chg>=0?"▲":"▼"}{Math.abs(chg).toFixed(2)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── SIMULATOR ── */}
        {tab==="trade"&&(
          <div style={{animation:"slide-in .3s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              {[["💰 Balance","$"+balance.toLocaleString("en-US",{minimumFractionDigits:2}),balance>=10000?"#00e676":"#ff4444"],
                ["📈 Open P&L",(totalPnL>=0?"+":"")+totalPnL.toFixed(2),totalPnL>=0?"#00e676":"#ff4444"],
                ["📋 Positions",portfolio.length,"#00bfff"],
                ["📝 Trades",tradeLog.length,"#ff9900"]].map(([l,v,c])=>(
                <div key={l} style={S.card()}>
                  <div style={{fontSize:10,color:"#4a6080"}}>{l}</div>
                  <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'Space Mono',monospace",marginTop:4}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:14}}>
              <div>
                <div style={{...S.card(),marginBottom:12}}>
                  <h3 style={{fontSize:13,fontWeight:700,marginBottom:12}}>🎯 Place Order</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>SYMBOL</label>
                      <select style={S.inp} value={tradeForm.symbol} onChange={e=>setTradeForm(f=>({...f,symbol:e.target.value}))}>
                        {STOCKS.map(s=><option key={s.symbol}>{s.symbol}</option>)}
                      </select></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>TYPE</label>
                        <select style={S.inp} value={tradeForm.type} onChange={e=>setTradeForm(f=>({...f,type:e.target.value}))}>
                          <option value="CALL">CALL 📈</option><option value="PUT">PUT 📉</option>
                        </select></div>
                      <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>EXPIRY</label>
                        <select style={S.inp} value={tradeForm.expiry} onChange={e=>setTradeForm(f=>({...f,expiry:e.target.value}))}>
                          <option value="0dte">0DTE</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="leaps">LEAPS</option>
                        </select></div>
                    </div>
                    <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>STRIKE PRICE ($)</label>
                      <input style={S.inp} type="number" value={tradeForm.strike}
                        placeholder={`e.g. ${Math.round((stockData[tradeForm.symbol]?.slice(-1)[0]?.close||200)/5)*5}`}
                        onChange={e=>setTradeForm(f=>({...f,strike:e.target.value}))}/></div>
                    <div><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>CONTRACTS</label>
                      <input style={S.inp} type="number" min="1" max="20" value={tradeForm.qty} onChange={e=>setTradeForm(f=>({...f,qty:e.target.value}))}/></div>
                    <div style={{background:"#060d1a",borderRadius:8,padding:10,fontSize:11,color:"#4a7090",border:"1px solid #0f1e30"}}>
                      Current: <strong style={{color:"#00bfff"}}>${(stockData[tradeForm.symbol]?.slice(-1)[0]?.close||0).toFixed(2)}</strong> · 1 contract = 100 shares
                    </div>
                    <button onClick={executeTrade} style={{...S.btn(),padding:12,fontSize:14}}>
                      🚀 BUY {tradeForm.qty}x {tradeForm.symbol} {tradeForm.type}
                    </button>
                    {tradeMsg&&<div style={{fontSize:11,padding:10,borderRadius:8,background:"#060d1a",border:"1px solid #0f1e30",color:tradeMsg.startsWith("✅")||tradeMsg.startsWith("🎉")?"#00e676":"#ff8888"}}>{tradeMsg}</div>}
                  </div>
                </div>
                <div style={{...S.card(),background:"#060a04",border:"1px solid #0a2208"}}>
                  <h3 style={{fontSize:11,fontWeight:700,marginBottom:6,color:"#44aa55"}}>⚠️ Educational Disclaimer</h3>
                  <p style={{fontSize:10,color:"#336644",lineHeight:1.6}}>This is paper trading only. Real options involve risk of total loss. Practice here for 30+ days before using real money. Never trade money you can't afford to lose.</p>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={S.card()}>
                  <h3 style={{fontSize:13,fontWeight:700,marginBottom:10}}>📋 Open Positions</h3>
                  {portfolio.length===0?<div style={{color:"#4a6080",fontSize:12,padding:16,textAlign:"center"}}>No open positions yet.</div>:(
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead><tr style={{borderBottom:"1px solid #0f1e30",color:"#4a6080"}}>
                        {["Symbol","Type","Strike","Premium","Curr","P&L","Close"].map(h=><th key={h} style={{padding:"5px 8px",textAlign:"left"}}>{h}</th>)}
                      </tr></thead>
                      <tbody>{portfolio.map(pos=>{
                        const cP=stockData[pos.symbol]?.slice(-1)[0]?.close||0;
                        const curr=pos.type==="CALL"?Math.max(0,cP-pos.strike):Math.max(0,pos.strike-cP);
                        const pnl=(curr-pos.premium)*100*pos.qty;
                        return(<tr key={pos.id} style={{borderBottom:"1px solid #0a1220"}}>
                          <td style={{padding:"7px 8px",fontWeight:700}}>{pos.symbol}</td>
                          <td><span style={S.badge(pos.type==="CALL"?"#0088ff":"#ff8800")}>{pos.type}</span></td>
                          <td>${pos.strike}</td>
                          <td>${pos.premium.toFixed(2)}</td>
                          <td style={{fontFamily:"'Space Mono',monospace"}}>${cP.toFixed(2)}</td>
                          <td style={{color:pnl>=0?"#00e676":"#ff4444",fontWeight:700}}>{pnl>=0?"+":""}{pnl.toFixed(2)}</td>
                          <td><button onClick={()=>closePos(pos)} style={{background:"linear-gradient(135deg,#cc2244,#991133)",border:"none",borderRadius:5,padding:"3px 8px",color:"#fff",cursor:"pointer",fontSize:10}}>CLOSE</button></td>
                        </tr>);
                      })}</tbody>
                    </table>
                  )}
                </div>
                <div style={S.card()}>
                  <h3 style={{fontSize:13,fontWeight:700,marginBottom:10}}>📝 Trade History</h3>
                  {tradeLog.length===0?<div style={{color:"#4a6080",fontSize:12}}>No trades yet.</div>:(
                    <div style={{maxHeight:220,overflowY:"auto",fontSize:11}}>
                      {tradeLog.map((t,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #0a1220",alignItems:"center"}}>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={S.badge(t.action==="BOUGHT"?"#0066ff":"#00cc66")}>{t.action}</span>
                            <span>{t.symbol} ${t.strike} {t.type} ×{t.qty}</span>
                          </div>
                          <div style={{textAlign:"right"}}>
                            {t.pnl!==undefined&&<span style={{color:t.pnl>=0?"#00e676":"#ff4444",fontWeight:700,marginRight:8}}>{t.pnl>=0?"+":""}${t.pnl.toFixed(2)}</span>}
                            <span style={{color:"#2a4060"}}>{t.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CALCULATOR ── */}
        {tab==="calc"&&(
          <div style={{animation:"slide-in .3s ease"}}>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>🧮 Trade Calculator Suite</h2>
            <p style={{color:"#4a7090",fontSize:13,marginBottom:16}}>Plan every trade BEFORE you enter. Successful traders know their numbers before clicking buy.</p>
            <div style={{...S.card(),marginBottom:14}}><PLCalc/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={S.card()}>
                <h3 style={{fontSize:14,fontWeight:700,marginBottom:12,color:"#4488cc"}}>📏 Position Size Calculator</h3>
                {(()=>{
                  const [acct,setAcct]=useState(10000), [riskPct,setRiskPct]=useState(1), [premCost,setPremCost]=useState(100);
                  const maxRisk=(acct*riskPct/100), contracts=Math.floor(maxRisk/premCost);
                  return(
                    <div style={{display:"flex",flexDirection:"column",gap:9}}>
                      {[["Account Size ($)",acct,setAcct],["Risk % Per Trade",riskPct,setRiskPct],["Cost Per Contract ($)",premCost,setPremCost]].map(([l,v,s])=>(
                        <div key={l}><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>{l}</label>
                          <input style={S.inp} type="number" value={v} onChange={e=>s(parseFloat(e.target.value)||0)}/></div>
                      ))}
                      <div style={{background:"#060d1a",borderRadius:8,padding:12,border:"1px solid #0f1e30"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:"#4a6080"}}>Max $ Risk</span><strong style={{color:"#ff9900"}}>${maxRisk.toFixed(2)}</strong></div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:"#4a6080"}}>Max Contracts</span><strong style={{color:"#00e676",fontSize:18}}>{contracts}</strong></div>
                        <div style={{fontSize:10,color:"#2a4060",marginTop:4}}>{contracts===0?"⚠️ Reduce contract cost or increase account size":"✅ Trade "+contracts+" contract"+(contracts!==1?"s":"")+" to stay within 1% risk rule"}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div style={S.card()}>
                <h3 style={{fontSize:14,fontWeight:700,marginBottom:12,color:"#4488cc"}}>💰 Compound Growth Calculator</h3>
                {(()=>{
                  const [start,setStart]=useState(5000),[monthly,setMonthly]=useState(10),[years,setYears]=useState(5);
                  const results=[];let v=start;
                  for(let y=1;y<=years;y++){for(let m=0;m<12;m++)v*=(1+monthly/100);results.push({y,v:Math.round(v)});}
                  const final=results[results.length-1]?.v||start;
                  const gain=final-start;
                  return(
                    <div style={{display:"flex",flexDirection:"column",gap:9}}>
                      {[["Starting Capital ($)",start,setStart],["Monthly Return (%)",monthly,setMonthly],["Years",years,setYears]].map(([l,val,s])=>(
                        <div key={l}><label style={{fontSize:10,color:"#4a6080",display:"block",marginBottom:3}}>{l}</label>
                          <input style={S.inp} type="number" value={val} onChange={e=>s(parseFloat(e.target.value)||0)}/></div>
                      ))}
                      <div style={{background:"#060d1a",borderRadius:8,padding:12,border:"1px solid #0f1e30"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:"#4a6080"}}>After {years} years</span><strong style={{color:"#00e676",fontSize:16,fontFamily:"'Space Mono',monospace"}}>${final.toLocaleString()}</strong></div>
                        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:"#4a6080"}}>Total Gain</span><strong style={{color:"#00bfff"}}>+${gain.toLocaleString()}</strong></div>
                        <div style={{fontSize:10,color:"#2a4060",marginTop:6}}>ROI: {((gain/start)*100).toFixed(0)}% | Monthly: ${(final/12).toFixed(0)}/mo by year {years}</div>
                      </div>
                      <div style={{display:"flex",gap:4,height:60,alignItems:"flex-end"}}>
                        {results.filter((_,i)=>i%Math.ceil(results.length/8)===0||i===results.length-1).map((r,i,a)=>{
                          const maxV=a[a.length-1].v;
                          return(<div key={r.y} style={{flex:1,background:"linear-gradient(0deg,#0055ee,#00aaff)",borderRadius:"3px 3px 0 0",height:`${(r.v/maxV)*100}%`,minHeight:4,display:"flex",alignItems:"flex-start",justifyContent:"center"}}>
                            <span style={{fontSize:7,color:"#00bfff",marginTop:2}}>{r.y}y</span>
                          </div>);
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div style={{...S.card(),marginTop:14}}>
              <h3 style={{fontSize:14,fontWeight:700,marginBottom:12,color:"#4488cc"}}>📅 Earnings Calendar</h3>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{borderBottom:"1px solid #0f1e30",color:"#4a6080"}}>
                    {["Symbol","Date","Est EPS","Act EPS","Est Rev","Act Rev","Surprise"].map(h=><th key={h} style={{padding:"8px",textAlign:"left"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>{EARNINGS_CAL.map(e=>{
                    const beat=e.act_eps!==null&&e.act_eps>e.est_eps;
                    const miss=e.act_eps!==null&&e.act_eps<e.est_eps;
                    return(<tr key={e.symbol} style={{borderBottom:"1px solid #0a1220"}}>
                      <td style={{padding:"8px",fontWeight:700}}>{e.symbol}</td>
                      <td style={{padding:"8px",color:"#4a6080"}}>{e.date}</td>
                      <td style={{padding:"8px"}}>${e.est_eps}</td>
                      <td style={{padding:"8px",color:beat?"#00e676":miss?"#ff4444":"#4a6080"}}>{e.act_eps??<span style={{color:"#2a4060"}}>Pending</span>}</td>
                      <td style={{padding:"8px"}}>{e.est_rev}</td>
                      <td style={{padding:"8px",color:e.act_rev?(e.act_rev>parseFloat(e.est_rev)?"#00e676":"#ff4444"):"#4a6080"}}>{e.act_rev?e.act_rev+"B":"—"}</td>
                      <td style={{padding:"8px"}}>{e.act_eps===null?<span style={{...S.badge("#ffaa00"),fontSize:10}}>UPCOMING</span>:beat?<span style={{...S.badge("#00e676"),fontSize:10}}>✅ BEAT</span>:<span style={{...S.badge("#ff4444"),fontSize:10}}>❌ MISS</span>}</td>
                    </tr>);
                  })}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── STRATEGIES ── */}
        {tab==="strategies"&&(
          <div style={{animation:"slide-in .3s ease"}}>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>⚔️ Options Strategy Library</h2>
            <p style={{color:"#4a7090",fontSize:13,marginBottom:16}}>From beginner single-leg trades to advanced multi-leg strategies. Master these to have a setup for every market condition.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:14}}>
              {STRATEGIES.map(s=>(
                <div key={s.name} style={{...S.card(),border:`1px solid ${s.direction.includes("Bullish")?"#003322":s.direction.includes("Bearish")?"#330011":"#1a2a40"}`,animation:"slide-in .3s ease"}} className="card-hover">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontSize:28}}>{s.icon}</span>
                      <div>
                        <div style={{fontWeight:800,fontSize:15}}>{s.name}</div>
                        <div style={{display:"flex",gap:5,marginTop:4}}>
                          <span style={S.badge(s.direction.includes("Bullish")?"#00cc66":s.direction.includes("Bearish")?"#ff4444":"#ffaa00")}>{s.direction}</span>
                          <span style={S.badge(s.complexity==="Beginner"?"#00aaff":s.complexity==="Intermediate"?"#ffaa00":"#ff6644")}>{s.complexity}</span>
                          <span style={S.badge("#888")}>{s.risk} Risk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:7,fontSize:12}}>
                    <div style={{background:"#060d1a",borderRadius:7,padding:"8px 10px"}}><span style={{color:"#4a6080"}}>When to use: </span>{s.when}</div>
                    <div style={{background:"#060d1a",borderRadius:7,padding:"8px 10px"}}><span style={{color:"#4a6080"}}>How: </span>{s.how}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      <div style={{background:"#001a08",borderRadius:7,padding:"7px 10px",border:"1px solid #00441a"}}><div style={{fontSize:9,color:"#4a6080"}}>MAX PROFIT</div><div style={{color:"#00e676",marginTop:2}}>{s.maxProfit}</div></div>
                      <div style={{background:"#1a0008",borderRadius:7,padding:"7px 10px",border:"1px solid #44001a"}}><div style={{fontSize:9,color:"#4a6080"}}>MAX LOSS</div><div style={{color:"#ff6666",marginTop:2}}>{s.maxLoss}</div></div>
                    </div>
                    <div style={{background:"#060d1a",borderRadius:7,padding:"8px 10px",border:"1px solid #0f2040"}}><span style={{fontSize:9,color:"#4488cc",fontWeight:700}}>📌 EXAMPLE: </span><span style={{color:"#8aafcc"}}>{s.example}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PATTERNS ── */}
        {tab==="patterns"&&(
          <div style={{animation:"slide-in .3s ease"}}>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>🎯 Chart Pattern Recognition</h2>
            <p style={{color:"#4a7090",fontSize:13,marginBottom:16}}>Learn to spot these repeating patterns on any chart. Each pattern has a high-probability outcome when confirmed by volume.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {PATTERNS.map(p=>(
                <div key={p.name} style={{...S.card(),border:`1px solid ${p.type==="Bullish"?"#003322":"#330011"}`}} className="card-hover">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:24}}>{p.icon}</span>
                      <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                    </div>
                    <span style={S.badge(p.type==="Bullish"?"#00cc66":"#ff4444")}>{p.type}</span>
                  </div>
                  <div style={{fontSize:12,color:"#8aafcc",lineHeight:1.6,marginBottom:10}}>{p.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,color:"#4a6080"}}>Historical Win Rate</div>
                    <div style={{fontSize:15,fontWeight:700,color:parseFloat(p.winRate)>=70?"#00e676":"#ffaa00",fontFamily:"'Space Mono',monospace"}}>{p.winRate}</div>
                  </div>
                  <div style={{background:"#060d1a",borderRadius:5,height:4,marginTop:6,overflow:"hidden"}}>
                    <div style={{width:p.winRate,height:"100%",background:`linear-gradient(90deg,${p.type==="Bullish"?"#00cc66":"#ff4444"},#00aaff)`}}/>
                  </div>
                  <div style={{marginTop:8,fontSize:10,color:"#2a4060"}}>
                    {p.type==="Bullish"?"💡 Trade: Buy calls on confirmed breakout":"💡 Trade: Buy puts on confirmed breakdown"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{...S.card("#0044cc33"),marginTop:14,border:"1px solid #0044cc22"}}>
              <h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>📌 Pattern Trading Rules</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8,fontSize:12}}>
                {["Never trade a pattern without volume confirmation — high volume validates the breakout",
                  "Wait for the candle to CLOSE above/below the pattern level, don't jump the gun",
                  "Set your stop loss on the other side of the pattern structure",
                  "Patterns on higher timeframes (daily, weekly) are more reliable than 1-minute charts",
                  "Failed patterns (false breakouts) can be powerful reversal trades in the opposite direction",
                  "Combine patterns with RSI and moving averages for higher-probability setups"].map(r=>(
                  <div key={r} style={{background:"#060d1a",borderRadius:8,padding:10,border:"1px solid #0f1e30",lineHeight:1.6,color:"#8aafcc"}}>
                    <span style={{color:"#0088ff"}}>→ </span>{r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DICTIONARY ── */}
        {tab==="dict"&&(
          <div style={{animation:"slide-in .3s ease"}}>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>📖 Complete Trading Dictionary</h2>
            <p style={{color:"#4a7090",fontSize:13,marginBottom:12}}>{DICTIONARY.length} terms across all areas of trading and investing. Search any term to understand it instantly.</p>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <input value={dictSearch} onChange={e=>setDictSearch(e.target.value)} placeholder="🔍 Search any trading term..."
                style={{...S.inp,flex:1,minWidth:200}}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {dictCats.map(c=>(
                  <button key={c} onClick={()=>setDictCat(c)}
                    style={{background:dictCat===c?"linear-gradient(135deg,#0055ee,#0033bb)":"#080f1c",border:"1px solid #1a2a40",borderRadius:7,padding:"6px 12px",color:dictCat===c?"#fff":"#4a6080",cursor:"pointer",fontSize:11,fontWeight:600}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div style={{fontSize:12,color:"#2a4060",marginBottom:10}}>{filteredDict.length} term{filteredDict.length!==1?"s":""} found</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:10}}>
              {filteredDict.map(d=>(
                <div key={d.term} style={{...S.card(),padding:"12px 14px"}} className="card-hover">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#d8eeff"}}>{d.term}</div>
                    <span style={{...S.badge("#4488cc"),fontSize:9,flexShrink:0,marginLeft:8}}>{d.cat}</span>
                  </div>
                  <div style={{fontSize:12,color:"#7a9fbf",lineHeight:1.65}}>{d.def}</div>
                </div>
              ))}
            </div>
            {filteredDict.length===0&&<div style={{textAlign:"center",padding:40,color:"#4a6080"}}>No terms found for "{dictSearch}". Try a different search.</div>}
          </div>
        )}

        {/* ── JOURNAL ── */}
        {tab==="journal"&&(
          <div style={{animation:"slide-in .3s ease"}}>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>📝 Trading Journal</h2>
            <p style={{color:"#4a7090",fontSize:13,marginBottom:14}}>The #1 habit of 7-figure traders. Log every trade, track emotions, and identify patterns in your wins AND losses.</p>
            <TradeJournal/>
          </div>
        )}

        {/* ── ROADMAP ── */}
        {tab==="roadmap"&&(
          <div style={{animation:"slide-in .3s ease"}}>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>🗺️ 7-Figure Trader Roadmap</h2>
            <p style={{color:"#4a7090",fontSize:13,marginBottom:16}}>The exact path from zero knowledge to building 7-figure wealth through trading. Follow each phase in order.</p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {ROADMAP.map((phase,i)=>(
                <div key={phase.phase} style={{display:"flex",gap:0}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginRight:16}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${phase.color},${phase.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,border:`2px solid ${phase.color}44`}}>{phase.icon}</div>
                    {i<ROADMAP.length-1&&<div style={{width:2,flex:1,background:`linear-gradient(${phase.color},${ROADMAP[i+1].color})`,margin:"4px 0",opacity:.3,minHeight:20}}/>}
                  </div>
                  <div style={{...S.card(),marginBottom:12,flex:1,borderLeft:`2px solid ${phase.color}44`,animation:"slide-in .3s ease"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{fontSize:10,color:phase.color,fontWeight:700,letterSpacing:2}}>{phase.phase}</div>
                        <div style={{fontSize:17,fontWeight:800,marginTop:2}}>{phase.title}</div>
                      </div>
                      <div style={{...S.badge(phase.color),fontSize:10}}>{phase.metrics.split(":")[0]}</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div>
                        <div style={{fontSize:10,color:"#4a6080",marginBottom:6,fontWeight:700}}>GOALS</div>
                        {phase.goals.map(g=><div key={g} style={{fontSize:12,color:"#8aafcc",padding:"3px 0",borderBottom:"1px solid #0a1220"}}>→ {g}</div>)}
                        <div style={{marginTop:8,background:"#060d1a",borderRadius:7,padding:8,fontSize:11,color:phase.color,border:`1px solid ${phase.color}22`}}>🎯 {phase.metrics}</div>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:"#4a6080",marginBottom:6,fontWeight:700}}>📚 RECOMMENDED READING</div>
                        {phase.books.map(b=><div key={b} style={{fontSize:11,color:"#4a6080",padding:"4px 0",borderBottom:"1px solid #0a1220"}}>📖 {b}</div>)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{...S.card("#cc00ff22"),border:"1px solid #cc00ff22",marginTop:4}}>
              <h3 style={{fontSize:15,fontWeight:800,marginBottom:10,color:"#cc88ff"}}>💎 The 7-Figure Wealth Formula</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,fontSize:12}}>
                {[["Trading Income","Options income + day/swing trading profits","#00e676"],["Growth Portfolio","Long-term stocks + index funds compounding","#00aaff"],["Passive Income","Dividends + covered calls + cash secured puts","#ffaa00"],["Real Assets","Real estate for appreciation + rental income","#ff6644"],["Tax Strategy","IRA/401k/HSA optimization, tax loss harvesting","#cc88ff"]].map(([t,d,c])=>(
                  <div key={t} style={{background:"#060d1a",borderRadius:8,padding:10,border:`1px solid ${c}22`}}>
                    <div style={{fontWeight:700,fontSize:12,color:c,marginBottom:4}}>{t}</div>
                    <div style={{fontSize:11,color:"#6a8090",lineHeight:1.5}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI COACH ── */}
        {tab==="ai"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,height:"calc(100vh - 160px)",animation:"slide-in .3s ease"}}>
            <div style={{...S.card(),display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:"0 0 10px",borderBottom:"1px solid #0f1e30",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
                <div>
                  <h2 style={{fontSize:15,fontWeight:800}}>🤖 AI Trading Coach — Powered by Claude</h2>
                  <p style={{fontSize:10,color:"#4a6080",marginTop:2}}>Ask about any trade, strategy, concept, or get personalized coaching</p>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <span style={{...S.badge("#00bfff"),fontSize:9}}>Watching {selStock.symbol}</span>
                  <span style={{...S.badge("#00e676"),fontSize:9,animation:"pulse 2s infinite"}}>● LIVE</span>
                </div>
              </div>
              <div style={{flex:1,overflow:"hidden"}}>
                <AICoach stock={selStock} candles={candles} balance={balance} portfolio={portfolio}/>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
              <div style={S.card()}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:8,color:"#4488cc"}}>📊 Live Market Data</div>
                {[["Symbol",selStock.symbol,"#d8eeff"],["Price","$"+currPrice.toFixed(2),"#00bfff"],["RSI",r,r>70?"#ff4444":r<30?"#00e676":"#00bfff"],["Signal",signal.text.split("—")[0],signal.color],["50 MA",m50?"$"+m50.toFixed(2):"—",currPrice>(m50||0)?"#00e676":"#ff9900"],["200 MA",m200?"$"+m200.toFixed(2):"—",currPrice>(m200||0)?"#00e676":"#ff4444"]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #0a1220"}}>
                    <span style={{fontSize:11,color:"#4a6080"}}>{l}</span>
                    <span style={{fontSize:11,fontWeight:700,color:c}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={S.card()}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:8,color:"#4488cc"}}>⚡ Quick Questions</div>
                {["What trade setup fits the current chart?","Explain the Greeks in 30 seconds","What's the best beginner strategy?","How do I size my position correctly?","What is IV crush and how to avoid it?","How does theta affect my trade?","Is this a good time to buy options?"].map(q=>(
                  <div key={q} style={{fontSize:10,color:"#4a7090",padding:"5px 6px",borderRadius:5,background:"#060d1a",marginBottom:4,cursor:"default",border:"1px solid #0f1e30",lineHeight:1.4}}>
                    💬 "{q}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}