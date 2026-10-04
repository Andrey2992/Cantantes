import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { DomainError } from '../../../domain/project/errors/DomainError.js';
import { ProjectSlug } from '../../../domain/project/value-objects/ProjectSlug.js';

/**
 * Validates the `:slug` route parameter by running it through the domain value
 * object.
 *
 * The canonical form is therefore enforced once, in the domain, and HTTP
 * reuses that rule instead of duplicating the pattern. An invalid slug is a
 * client error, so it becomes `400` with a fixed message that does not echo the
 * rejected input.
 */
@Injectable()
export class ParseProjectSlugPipe implements PipeTransform<
  string,
  ProjectSlug
> {
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
