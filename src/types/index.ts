// TypeScript types for ICD-10 Mobile Assistant

export interface Icd10Code {
  id: string;
  code: string;
  short_title: string;
  long_description: string | null;
  chapter: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  icd10_id: string;
  icd10_codes?: Icd10Code; // joined
}

export interface VisitNote {
  codes: Icd10Code[];
  createdAt: Date;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Search: undefined;
  Favorites: undefined;
  Visit: undefined;
  Profile: undefined;
};

export type SearchStackParamList = {
  Icd10Search: undefined;
  Icd10Detail: { code: Icd10Code };
};

export type FavoritesStackParamList = {
  FavoritesList: undefined;
  Icd10Detail: { code: Icd10Code };
};
