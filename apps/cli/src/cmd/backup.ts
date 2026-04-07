import { Sandbox } from '@pocketenv/sdk';
import consola from 'consola';
import z from 'zod';
import { c } from '../theme';
import process from "node:process";
import Table from "cli-table3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ttlSchema = z
  .string()
  .regex(/^\d+(m|h|d)$/, 'Invalid TTL format (e.g. 10m, 2h, 7d)')
  .transform((value) => {
    const amount = parseInt(value.slice(0, -1), 10);
    const unit = value.slice(-1);

    switch (unit) {
      case 'm':
        return amount * 60;
      case 'h':
        return amount * 60 * 60;
      case 'd':
        return amount * 60 * 60 * 24;
      default:
        throw new Error('Invalid TTL unit');
    }
  });

const backupOptionsSchema = z.object({
  description: z.string().optional(),
  ttl: ttlSchema.optional(),
});

export type BackupOptions = z.infer<typeof backupOptionsSchema>;

export async function createBackup(sandboxId: string, directory: string, options: BackupOptions) {
  try {
    const { data, error } = backupOptionsSchema.safeParse(options);
     if (error) {
       consola.error(`Invalid backup options: ${error.issues[0]?.message}`);
       process.exit(1);
     }

    const sandbox = await Sandbox.get(sandboxId);

    if (sandbox.data.provider !== "cloudflare") {
      consola.error(`Backups are only supported for sandboxes running on Cloudflare Workers`);
      process.exit(1);
    }

    const { description, ttl } = data;

    await sandbox.backup.create(
      directory,
      description,
      ttl,
    );
    consola.success(`Backup request for sandbox ${c.primary(sandboxId)} at directory ${c.primary(directory)} created successfully`);
    consola.log(`  This may take a few moments to complete.\n  Run ${c.primary(`pocketenv backup ls ${sandboxId}`)} to check the status of your backup.`);
  } catch (e) {
    consola.error(`Failed to create backup for sandbox`, e);
    process.exit(1);
  }
}

export async function restoreBackup(backupId: string) {
  try {
  await Sandbox.restoreBackup(backupId);
    consola.success(`Backup ${c.primary(backupId)} restored successfully`);
  } catch {
    consola.error(`Failed to restore backup ${c.primary(backupId)}`);
    process.exit(1);
  }
}

export async function listBackups(sandboxId: string) {
  const sandbox = await Sandbox.get(sandboxId);
  try {
    const { backups } = await sandbox.backup.list();

    const table = new Table({
      head: [
        c.primary("BACKUP ID"),
        c.primary("DIRECTORY"),
        c.primary("CREATED AT"),
        c.primary("EXPIRES AT"),
      ],
      chars: {
        top: "",
        "top-mid": "",
        "top-left": "",
        "top-right": "",
        bottom: "",
        "bottom-mid": "",
        "bottom-left": "",
        "bottom-right": "",
        left: "",
        "left-mid": "",
        mid: "",
        "mid-mid": "",
        right: "",
        "right-mid": "",
        middle: " ",
      },
      style: {
        border: [],
        head: [],
      },
    });

    for (const backup of backups) {
      table.push([
        c.secondary(backup.id),
        backup.directory,
        dayjs(backup.createdAt).fromNow(),
        backup.expiresAt ? dayjs(backup.expiresAt).fromNow() : "Never",
      ]);
    }

    consola.log(table.toString());
  } catch {
    consola.error(`Failed to list backups for sandbox ${c.primary(sandboxId)}`);
    process.exit(1);
  }
}
