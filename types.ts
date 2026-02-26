
// FIX: Define all necessary types for the application to resolve import errors.
export type Tab = 'scores' | 'news' | 'highlights' | 'standings' | 'moneypuck' | 'naturalStatTrick' | 'statCards' | 'lineups' | 'puckpedia';

export interface Team {
  id: number;
  name: {
    default: string;
  };
  abbrev: string;
  score: number;
  placeName?: {
    default: string;
  };
}

export interface Game {
  id: number;
  gameState: 'FUT' | 'PRE' | 'LIVE' | 'CRIT' | 'FINAL' | 'OFF';
  startTimeUTC: string;
  venue: {
    default: string;
  };
  awayTeam: Team;
  homeTeam: Team;
}

export interface TeamRecord {
    teamName: {
        default: string;
    };
    teamAbbrev: {
        default: string;
    };
    divisionRank: string;
    conferenceRank: string;
    leagueRank: string;
    points: number;
    wins: number;
    losses: number;
    otLosses: number;
    gamesPlayed: number;
    clinchIndicator?: string;
    goalFor?: number;
    goalAgainst?: number;
    goalDifferential?: number;
}

export interface DivisionStandings {
    divisionName: string;
    conferenceName: string;
    teamRecords: TeamRecord[];
}

export interface StandingsData {
    [conferenceName: string]: DivisionStandings[];
}

export interface Player {
    id: number;
    headshot: string;
    firstName: {
        default: string;
    };
    lastName: {
        default: string;
    };
    sweaterNumber: number;
    positionCode: 'C' | 'L' | 'R' | 'D' | 'G';
}

export interface TeamLineup {
    forwards: Player[];
    defense: Player[];
    goalies: Player[];
}

export interface LineupData {
    awayTeam: TeamLineup;
    homeTeam: TeamLineup;
}

export interface Highlight {
    id: string;
    videoUrl: string;
    title: string;
    description: string;
}

export interface Article {
    id: string;
    url: string;
    title: string;
    description: string;
    imageUrl: string;
    publishedAt: string;
    source: string;
}

// Boxscore and Game Details Types
export interface ScoringPlay {
    period: number;
    timeInPeriod: string;
    goalScorer: {
        name: { default: string };
        assists: { name: { default: string }}[]
    };
    teamAbbrev: { default: string };
    strength: string;
    situationCode?: string;
    highlightClip?: number | string;
    video?: {
        videoId: string;
        videoUrl: string;
        title: string;
        description: string;
    };
    awayScore?: number;
    homeScore?: number;
}

export interface Penalty {
    period: number;
    timeInPeriod: string;
    type: string;
    duration: number;
    committedByPlayer: string;
    teamAbbrev: { default: string };
}

export interface TeamGameStat {
    category: string;
    awayValue: number | string;
    homeValue: number | string;
}

export interface RosterPlayer {
  playerId: number;
  teamId: number;
  firstName: { default: string };
  lastName: { default: string };
  sweaterNumber: number;
  positionCode: string;
  headshot: string;
}

export interface PlayerGameStat {
    playerId: number;
    name: { default: string };
    headshot: string;
    sweaterNumber: number;
    positionCode: string;
    goals: number;
    assists: number;
    points: number;
    plusMinus: number;
    toi: string;
    shots: number; 
    hits: number;
    blockedShots: number;
    pim: number;
    saves?: number;
    shotsAgainst?: number;
    goalsAgainst?: number;
    savePctg?: string;
}

export interface PlayerStatsGroup {
    forwards: PlayerGameStat[];
    defense: PlayerGameStat[];
    goalies: PlayerGameStat[];
}

export interface PlayerByGameStats {
    awayTeam: PlayerStatsGroup;
    homeTeam: PlayerStatsGroup;
}

export interface BoxscoreData {
    summary: {
        scoring: ScoringPlay[];
        penalties: Penalty[];
    };
    teamGameStats?: TeamGameStat[];
    playerByGameStats?: PlayerByGameStats;
    rosterSpots: RosterPlayer[];
}
