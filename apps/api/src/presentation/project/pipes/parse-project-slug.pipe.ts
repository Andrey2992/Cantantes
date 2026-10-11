import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { DomainError } from '../../../domain/shared/errors/DomainError.js';
import { ProjectSlug } from '../../../domain/project/value-objects/ProjectSlug.js';

/**
 * EN: Validates the `:slug` route parameter by running it through the domain value
 * object.
 *
 * The canonical form is therefore enforced once, in the domain, and HTTP
 * reuses that rule instead of duplicating the pattern. An invalid slug is a
 * client error, so it becomes `400` with a fixed message that does not echo the
 * rejected input.
 *
 * ES: Valida el parámetro de ruta `:slug` pasándolo por el value object de
 * dominio.
 *
 * La forma canónica se aplica una sola vez, en el dominio, y HTTP reutiliza esa
 * regla en lugar de duplicar el patrón. Un slug inválido es un error de cliente,
 * así que se convierte en `400` con un mensaje fijo que no repite la entrada
 * rechazada.
 */
@Injectable()
export class ParseProjectSlugPipe implements PipeTransform<
  string,
  ProjectSlug
> {
  /**
   * EN: Converts the raw route parameter into a `ProjectSlug`.
   * @param value Raw `:slug` string from the URL.
   * @returns A valid {@link ProjectSlug}.
   * @throws {BadRequestException} When the domain rejects the slug.
   *
   * ES: Convierte el parámetro de ruta crudo en un `ProjectSlug`.
   * @param value Cadena `:slug` cruda de la URL.
   * @returns Un {@link ProjectSlug} válido.
   * @throws {BadRequestException} Cuando el dominio rechaza el slug.
   */
  transform(value: string): ProjectSlug {
    try {
      return ProjectSlug.of(value);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException('Invalid project slug');
      }

      throw error;
    }
  }
}
