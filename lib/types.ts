export interface Client {
  id: string;
  phone: string;
  boissons_total: number;
  boissons_depuis_derniere_roue: number;
  tours_disponibles: number;
  created_at: string;
  updated_at: string;
}

export interface Gain {
  id: string;
  client_id: string;
  lot_label: string;
  lot_valeur: string;
  statut: "en_attente" | "valide" | "refuse";
  created_at: string;
  valide_at: string | null;
}

export interface RoueConfig {
  id: string;
  seuil_boissons: number;
  lots: RouteLot[];
  updated_at: string;
}

export interface RouteLot {
  id: string;
  label: string;
  valeur: string;
  probabilite: number;
  couleur: string;
}

export interface Evenement {
  id: string;
  titre: string;
  type: "karaoke" | "scene_ouverte" | "autre";
  date: string;
  heure: string;
  description: string | null;
  actif: boolean;
  created_at: string;
}

export interface Inscription {
  id: string;
  evenement_id: string;
  nom: string;
  instrument: string | null;
  commentaire: string | null;
  phone: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  evenement_id: string;
  inscription_id: string;
  session_id: string;
  created_at: string;
}
