import {
    camposTrazabilidad,
    type CambioTrazabilidad,
    type VersionTrazabilidad,
} from '@/types/trazabilidad';

export function compararVersiones(
    versionAnterior: VersionTrazabilidad,
    versionNueva: VersionTrazabilidad,
): CambioTrazabilidad[] {
    return camposTrazabilidad.reduce<CambioTrazabilidad[]>(
        (cambios, { clave, etiqueta }) => {
            const anterior = versionAnterior.estadoCompleto?.[clave] ?? '';
            const nuevo = versionNueva.estadoCompleto?.[clave] ?? '';

            if (anterior !== nuevo) {
                cambios.push({ campo: clave, etiqueta, anterior, nuevo });
            }

            return cambios;
        },
        [],
    );
}
