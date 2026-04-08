export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export type Database = {
	__InternalSupabase: {
		PostgrestVersion: "14.5"
	}
	public: {
		Tables: {
			alertas_equipos: {
				Row: {
					codigo_falla: string
					created_at: string
					descripcion_falla: string
					estado: string
					fecha_deteccion: string
					fecha_reconocimiento: string | null
					fecha_resolucion: string | null
					id: string
					id_equipo: string
					marca: string
					modelo: string
					parametros: Json | null
					severidad: string
				}
				Insert: {
					codigo_falla: string
					created_at?: string
					descripcion_falla: string
					estado?: string
					fecha_deteccion?: string
					fecha_reconocimiento?: string | null
					fecha_resolucion?: string | null
					id?: string
					id_equipo: string
					marca: string
					modelo: string
					parametros?: Json | null
					severidad: string
				}
				Update: {
					codigo_falla?: string
					created_at?: string
					descripcion_falla?: string
					estado?: string
					fecha_deteccion?: string
					fecha_reconocimiento?: string | null
					fecha_resolucion?: string | null
					id?: string
					id_equipo?: string
					marca?: string
					modelo?: string
					parametros?: Json | null
					severidad?: string
				}
				Relationships: [
					{
						foreignKeyName: "alertas_equipos_id_equipo_fkey"
						columns: ["id_equipo"]
						isOneToOne: false
						referencedRelation: "equipos"
						referencedColumns: ["id"]
					},
				]
			}
			areas_produccion: {
				Row: {
					created_at: string
					descripcion: string | null
					id: string
					nombre: string
					tipo: string
					ubicacion: string
				}
				Insert: {
					created_at?: string
					descripcion?: string | null
					id?: string
					nombre: string
					tipo: string
					ubicacion: string
				}
				Update: {
					created_at?: string
					descripcion?: string | null
					id?: string
					nombre?: string
					tipo?: string
					ubicacion?: string
				}
				Relationships: []
			}
			envios_formularios: {
				Row: {
					created_at: string
					estado: string
					fecha_envio: string
					id: string
					id_equipo: string | null
					id_formulario: string
					id_usuario: string
					respuestas: Json
					version_formulario: number
				}
				Insert: {
					created_at?: string
					estado?: string
					fecha_envio?: string
					id?: string
					id_equipo?: string | null
					id_formulario: string
					id_usuario: string
					respuestas?: Json
					version_formulario?: number
				}
				Update: {
					created_at?: string
					estado?: string
					fecha_envio?: string
					id?: string
					id_equipo?: string | null
					id_formulario?: string
					id_usuario?: string
					respuestas?: Json
					version_formulario?: number
				}
				Relationships: [
					{
						foreignKeyName: "envios_formularios_id_equipo_fkey"
						columns: ["id_equipo"]
						isOneToOne: false
						referencedRelation: "equipos"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "envios_formularios_id_formulario_fkey"
						columns: ["id_formulario"]
						isOneToOne: false
						referencedRelation: "form_templates"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "envios_formularios_id_usuario_fkey"
						columns: ["id_usuario"]
						isOneToOne: false
						referencedRelation: "profiles"
						referencedColumns: ["id"]
					},
				]
			}
			equipos: {
				Row: {
					created_at: string
					dispositivo_iot: Json | null
					estado: string
					id: string
					id_area: string | null
					nombre: string
					proximo_mantenimiento: string | null
					tiene_iot: boolean
					tipo: string
					ubicacion: string
					ultimo_mantenimiento: string | null
					updated_at: string
				}
				Insert: {
					created_at?: string
					dispositivo_iot?: Json | null
					estado?: string
					id?: string
					id_area?: string | null
					nombre: string
					proximo_mantenimiento?: string | null
					tiene_iot?: boolean
					tipo: string
					ubicacion: string
					ultimo_mantenimiento?: string | null
					updated_at?: string
				}
				Update: {
					created_at?: string
					dispositivo_iot?: Json | null
					estado?: string
					id?: string
					id_area?: string | null
					nombre?: string
					proximo_mantenimiento?: string | null
					tiene_iot?: boolean
					tipo?: string
					ubicacion?: string
					ultimo_mantenimiento?: string | null
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "equipos_id_area_fkey"
						columns: ["id_area"]
						isOneToOne: false
						referencedRelation: "areas_produccion"
						referencedColumns: ["id"]
					},
				]
			}
			form_templates: {
				Row: {
					activo: boolean
					asociacion: Json
					campos: Json
					created_at: string
					descripcion: string
					frecuencia: string | null
					id: string
					nombre: string
					tipo: string
					updated_at: string
					version: number
				}
				Insert: {
					activo?: boolean
					asociacion?: Json
					campos?: Json
					created_at?: string
					descripcion?: string
					frecuencia?: string | null
					id?: string
					nombre: string
					tipo: string
					updated_at?: string
					version?: number
				}
				Update: {
					activo?: boolean
					asociacion?: Json
					campos?: Json
					created_at?: string
					descripcion?: string
					frecuencia?: string | null
					id?: string
					nombre?: string
					tipo?: string
					updated_at?: string
					version?: number
				}
				Relationships: []
			}
			kpis: {
				Row: {
					created_at: string
					id: string
					nombre: string
					periodo: string
					tendencia: string
					unidad: string
					valor: number
				}
				Insert: {
					created_at?: string
					id?: string
					nombre: string
					periodo: string
					tendencia: string
					unidad: string
					valor: number
				}
				Update: {
					created_at?: string
					id?: string
					nombre?: string
					periodo?: string
					tendencia?: string
					unidad?: string
					valor?: number
				}
				Relationships: []
			}
			ordenes_trabajo: {
				Row: {
					checklist: Json
					created_at: string
					descripcion: string
					estado: string
					fecha_creacion: string
					fecha_fin_real: string | null
					fecha_inicio_programada: string | null
					fecha_inicio_real: string | null
					id: string
					id_alerta: string | null
					id_equipo: string
					notas: string | null
					prioridad: string
					solicitante: string
					tecnico_asignado: string
					tiempo_estimado_horas: number | null
					tiempo_real_horas: number | null
					tipo: string
					titulo: string
					updated_at: string
				}
				Insert: {
					checklist?: Json
					created_at?: string
					descripcion: string
					estado?: string
					fecha_creacion?: string
					fecha_fin_real?: string | null
					fecha_inicio_programada?: string | null
					fecha_inicio_real?: string | null
					id?: string
					id_alerta?: string | null
					id_equipo: string
					notas?: string | null
					prioridad: string
					solicitante: string
					tecnico_asignado: string
					tiempo_estimado_horas?: number | null
					tiempo_real_horas?: number | null
					tipo: string
					titulo: string
					updated_at?: string
				}
				Update: {
					checklist?: Json
					created_at?: string
					descripcion?: string
					estado?: string
					fecha_creacion?: string
					fecha_fin_real?: string | null
					fecha_inicio_programada?: string | null
					fecha_inicio_real?: string | null
					id?: string
					id_alerta?: string | null
					id_equipo?: string
					notas?: string | null
					prioridad?: string
					solicitante?: string
					tecnico_asignado?: string
					tiempo_estimado_horas?: number | null
					tiempo_real_horas?: number | null
					tipo?: string
					titulo?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "ordenes_trabajo_id_alerta_fkey"
						columns: ["id_alerta"]
						isOneToOne: false
						referencedRelation: "alertas_equipos"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "ordenes_trabajo_id_equipo_fkey"
						columns: ["id_equipo"]
						isOneToOne: false
						referencedRelation: "equipos"
						referencedColumns: ["id"]
					},
				]
			}
			profiles: {
				Row: {
					created_at: string
					departamento: string
					email: string
					id: string
					nombre: string
					rol: string
					updated_at: string
				}
				Insert: {
					created_at?: string
					departamento?: string
					email: string
					id: string
					nombre: string
					rol: string
					updated_at?: string
				}
				Update: {
					created_at?: string
					departamento?: string
					email?: string
					id?: string
					nombre?: string
					rol?: string
					updated_at?: string
				}
				Relationships: []
			}
			registros_mantenimiento: {
				Row: {
					costo: number | null
					created_at: string
					descripcion: string
					estado: string
					fecha_fin: string | null
					fecha_inicio: string
					horas_empleadas: number | null
					id: string
					id_equipo: string
					tecnico: string
					tipo: string
				}
				Insert: {
					costo?: number | null
					created_at?: string
					descripcion: string
					estado?: string
					fecha_fin?: string | null
					fecha_inicio: string
					horas_empleadas?: number | null
					id?: string
					id_equipo: string
					tecnico: string
					tipo: string
				}
				Update: {
					costo?: number | null
					created_at?: string
					descripcion?: string
					estado?: string
					fecha_fin?: string | null
					fecha_inicio?: string
					horas_empleadas?: number | null
					id?: string
					id_equipo?: string
					tecnico?: string
					tipo?: string
				}
				Relationships: [
					{
						foreignKeyName: "registros_mantenimiento_id_equipo_fkey"
						columns: ["id_equipo"]
						isOneToOne: false
						referencedRelation: "equipos"
						referencedColumns: ["id"]
					},
				]
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			get_user_role: { Args: never; Returns: string }
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never
