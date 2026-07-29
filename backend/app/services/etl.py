from typing import Tuple, Dict, Any
import pandas as pd

def load_raw_files(activity_path: str, employees_path: str) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Loads raw activity CSV and employees JSON files.
    
    Args:
        activity_path: Path to the raw activity CSV file.
        employees_path: Path to the raw employees JSON file.
        
    Returns:
        Tuple containing the raw activity dataframe, raw employees dataframe, and a loading report dictionary.
    """
    pass

def normalize_activity(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans and normalizes the activity dataframe.
    
    Rules:
    - Dedupe exact duplicate activity rows
    - Parse mixed timestamp formats
    - Normalize app names and task categories
    - Normalize repetitive flags
    - Flag negative, missing, zero, and outlier durations
    
    Args:
        df: Raw activity dataframe.
        
    Returns:
        Tuple containing the cleaned activity dataframe and an activity normalization report dictionary.
    """
    pass

def normalize_employees(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans and normalizes the employees dataframe.
    
    Rules:
    - Resolve duplicate employee E007 by preferring newer flat-schema record
    - Keep E013 with metadata_missing
    - Keep E099 as no-activity employee in reporting context
    
    Args:
        df: Raw employees dataframe.
        
    Returns:
        Tuple containing the cleaned employees dataframe and an employees normalization report dictionary.
    """
    pass

def build_joined_dataset(activity_df: pd.DataFrame, employees_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Joins the cleaned activity and employees datasets into a single denormalized dataset.
    
    Args:
        activity_df: Cleaned activity dataframe.
        employees_df: Cleaned employees dataframe.
        
    Returns:
        Tuple containing the joined dataset and a join report dictionary.
    """
    pass
