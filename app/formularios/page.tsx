"use client";

import { Eye, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  enviosFormularios,
  equipos,
  formulariosTemplate,
  usuarios,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function FormulariosPage() {
  const router = useRouter();
  const [selectedEnvio, setSelectedEnvio] = useState<string | null>(null);

  // Prepare table data with joins
  const tableData = enviosFormularios.map((envio) => {
    const formulario = formulariosTemplate.find(
      (f) => f.id === envio.idFormulario,
    );
    const equipo = equipos.find((e) => e.id === envio.idEquipo);
    const usuario = usuarios.find((u) => u.id === envio.idUsuario);

    return {
      id: envio.id,
      titulo: formulario?.nombre || "N/A",
      tipo: formulario?.tipo || "N/A",
      area: equipo?.ubicacion || "N/A",
      fecha: envio.fechaEnvio,
      estado: envio.estado,
      usuario: usuario?.nombre || "N/A",
      formulario,
      equipo,
    };
  });

  const selectedData = tableData.find((d) => d.id === selectedEnvio);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Portal Industrial
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Formularios</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header with actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Gestión de Formularios</h1>
              <p className="text-sm text-muted-foreground">
                Administra y revisa los formularios enviados
              </p>
            </div>
            <Button onClick={() => router.push("/formularios/constructor")}>
              <Plus className="mr-2 size-4" weight="bold" />
              Nuevo Formulario
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedEnvio(row.id)}
                  >
                    <TableCell className="font-medium">{row.titulo}</TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {row.tipo.replace("-", " ")}
                      </span>
                    </TableCell>
                    <TableCell>{row.area}</TableCell>
                    <TableCell>
                      {row.fecha.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          row.estado === "completado" &&
                            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                          row.estado === "pendiente" &&
                            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                          row.estado === "rechazado" &&
                            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                        )}
                      >
                        {row.estado === "completado"
                          ? "Completado"
                          : row.estado === "pendiente"
                            ? "Pendiente"
                            : "Rechazado"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEnvio(row.id);
                          }}
                        >
                          <Eye className="size-4" weight="duotone" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Visual only
                          }}
                        >
                          <PencilSimple className="size-4" weight="duotone" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Visual only
                          }}
                        >
                          <Trash className="size-4" weight="duotone" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>

      {/* Detail Dialog */}
      <Dialog
        open={selectedEnvio !== null}
        onOpenChange={() => setSelectedEnvio(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedData?.titulo}</DialogTitle>
            <DialogDescription>
              Enviado por {selectedData?.usuario} el{" "}
              {selectedData?.fecha.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tipo:</span>
                <p className="text-muted-foreground capitalize">
                  {selectedData?.tipo.replace("-", " ")}
                </p>
              </div>
              <div>
                <span className="font-medium">Área:</span>
                <p className="text-muted-foreground">{selectedData?.area}</p>
              </div>
              <div>
                <span className="font-medium">Equipo:</span>
                <p className="text-muted-foreground">
                  {selectedData?.equipo?.nombre}
                </p>
              </div>
              <div>
                <span className="font-medium">Estado:</span>
                <p className="text-muted-foreground capitalize">
                  {selectedData?.estado}
                </p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">Descripción:</span>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedData?.formulario?.descripcion}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
