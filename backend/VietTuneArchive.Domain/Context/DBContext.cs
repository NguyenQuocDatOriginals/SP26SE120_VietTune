using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VietTuneArchive.Domain.Entities;
using VietTuneArchive.Domain.Entities.Enum;
using ContextEntity = VietTuneArchive.Domain.Entities.Context;

namespace VietTuneArchive.Domain.Context
{
    public class DBContext : DbContext
    {
        public DBContext() { }
        public DBContext(DbContextOptions<DBContext> options) : base(options) { }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Song> Songs { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Instrument> Instruments { get; set; }
        public DbSet<Region> Regions { get; set; }
        public DbSet<Province> Provinces { get; set; }
        public DbSet<ContextEntity> Contexts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.PhoneNumber).IsRequired();
                entity.Property(e => e.Password).IsRequired();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Song entity
            modelBuilder.Entity<Song>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired();
                entity.Property(e => e.Performer).IsRequired();
                entity.Property(e => e.Author).IsRequired();
                entity.Property(e => e.Dialect).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Genre entity
            modelBuilder.Entity<Genre>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Configure one-to-many relationship with Submission
                entity.HasMany(e => e.Submissions)
                    .WithOne(s => s.Genre)
                    .HasForeignKey(s => s.GenreId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Instrument entity
            modelBuilder.Entity<Instrument>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Region entity
            modelBuilder.Entity<Region>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Configure one-to-many relationship with Province
                entity.HasMany(e => e.Provinces)
                    .WithOne(p => p.Region)
                    .HasForeignKey(p => p.RegionId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Province entity
            modelBuilder.Entity<Province>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Configure one-to-many relationship with Submission
                entity.HasMany(e => e.Submissions)
                    .WithOne(s => s.Province)
                    .HasForeignKey(s => s.ProvinceId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Context entity
            modelBuilder.Entity<ContextEntity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.ToTable("Contexts"); // Rename table to avoid SQL keyword conflict

                // Configure one-to-many relationship with Submission
                entity.HasMany(e => e.Submissions)
                    .WithOne(s => s.Context)
                    .HasForeignKey(s => s.ContextId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Submission entity
            modelBuilder.Entity<Submission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired();
                entity.Property(e => e.Performer).IsRequired();
                entity.Property(e => e.Author).IsRequired();
                entity.Property(e => e.Dialect).IsRequired();
                entity.Property(e => e.Status).HasConversion<string>();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Configure foreign keys
                entity.HasOne(e => e.Genre)
                    .WithMany(g => g.Submissions)
                    .HasForeignKey(e => e.GenreId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Province)
                    .WithMany(p => p.Submissions)
                    .HasForeignKey(e => e.ProvinceId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Context)
                    .WithMany(c => c.Submissions)
                    .HasForeignKey(e => e.ContextId)
                    .OnDelete(DeleteBehavior.SetNull);

                // Configure many-to-many relationship with Instrument
                entity.HasMany(e => e.Instruments)
                    .WithMany(i => i.Submissions)
                    .UsingEntity(j => j.ToTable("SubmissionInstruments"));
            });
        }
    }
}
//Add-Migration InitMigration -Context DBContext -Project VietTuneArchive.Domain -StartupProject VietTuneArchive.API -OutputDir Context/Migrations
