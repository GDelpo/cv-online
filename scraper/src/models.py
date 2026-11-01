from dataclasses import dataclass, field


@dataclass
class PersonalInfo:
    name: str
    title: str
    description: str
    photo: str


@dataclass
class ExperienceSection:
    title: str
    items: list[str] = field(default_factory=list)


@dataclass
class ExperienceEntry:
    title: str
    company: str
    period: str
    location: str
    description: str
    sections: list[ExperienceSection] = field(default_factory=list)


@dataclass
class EducationEntry:
    title: str
    institution: str
    period: str


@dataclass
class CertificationEntry:
    title: str
    institution: str
    date: str
    credentialUrl: str
    credentialId: str
    verified: bool


@dataclass
class CoursesEntry:
    title: str
    platform: str


@dataclass
class LanguageEntry:
    language: str
    level: str
    certifications: str = ''
